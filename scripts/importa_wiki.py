#!/usr/bin/env python3
"""VERZUM Wiki -> archivio statico interno. Richiede un'esportazione HTML autorizzata.
Uso: python scripts/importa_wiki.py /percorso/esportazione-wiki/
     python scripts/importa_wiki.py /percorso/esportazione-wiki.zip

Non esegue JavaScript, non scarica dalla rete e non naviga siti terzi.
Riscrive i collegamenti della wiki in #wiki/<percorso>, importa immagini presenti
nell'esportazione e rimuove script, iframe, eventi inline e link non permessi.
"""
from __future__ import annotations
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, quote
from urllib.request import Request, urlopen
import hashlib
import json
import re
import shutil
import sys
import tempfile
import zipfile

BASE = Path(__file__).resolve().parents[1] / 'public'
DEST = BASE / 'wiki-assets'
OUTPUT = BASE / 'wiki-data.generated.js'
ALLOWED = {'h1','h2','h3','h4','p','ul','ol','li','strong','b','em','i','blockquote','table','thead','tbody','tr','td','th','pre','code','a','img','details','summary','br','hr','div','span'}
VOID = {'img','br','hr'}
SKIP = {'script','style','iframe','object','embed','form','input','button','video','audio','svg','canvas','nav','header','footer','aside'}
IMG_TYPES = {'.png','.jpg','.jpeg','.gif','.webp','.svg'}
GROUPS = {'guides':'Guide','systems':'Sistemi','dungeons':'Dungeon','item':'Oggetti','mob':'Mostri e Metin',
          'map':'Mappe','npc':'NPC','quest':'Missioni','events':'Eventi','chests':'Bauli'}

def page_slug(file: Path, root: Path) -> str:
    relative = file.relative_to(root).as_posix()
    relative = re.sub(r'^.*?/it/', '', relative) if '/it/' in relative else re.sub(r'^it/','',relative)
    relative = re.sub(r'\.html?$', '', relative,flags=re.I)
    relative = re.sub(r'/index$', '', relative,flags=re.I)
    return relative.strip('/') or 'home'

def page_title(html: str, fallback: str) -> str:
    for pattern in (r'<h1\b[^>]*>(.*?)</h1>', r'<title\b[^>]*>(.*?)</title>'):
        m = re.search(pattern,html,re.I|re.S)
        if m:
            title = unescape(re.sub(r'<[^>]*>','',m.group(1))).strip()
            if title:
                return re.sub(r'\s+',' ',re.sub(r' - Verzum Wiki$','',title)).strip()
    return fallback.replace('_',' ').title()

def main_area(html: str) -> str:
    for tag in ('main','article'):
        m=re.search(r'<'+tag+r'\b[^>]*>(.*?)</'+tag+r'>',html,re.I|re.S)
        if m: return m.group(1)
    for selector in (r'id=["\'](?:wiki-content|mw-content-text|content)["\']',
                     r'class=["\'][^"\']*(?:wiki-content|mw-parser-output)[^"\']*["\']'):
        m=re.search(r'<div\b[^>]*'+selector+r'[^>]*>(.*?)</div>',html,re.I|re.S)
        if m: return m.group(1)
    m=re.search(r'<body\b[^>]*>(.*?)</body>',html,re.I|re.S)
    return m.group(1) if m else html

def normalized_internal(url: str, current: str) -> str | None:
    if not url or url.startswith(('javascript:','data:','mailto:','tel:')): return None
    u=urlsplit(url)
    host=(u.netloc or '').lower()
    if host and host not in {'wiki.verzum.to','www.wiki.verzum.to'}: return None
    if url.startswith('#'): return '#wiki/'+quote(current, safe='/')
    p=unquote(u.path).strip('/')
    if p.startswith('it/'): p=p[3:]
    elif re.match(r'^[a-z]{2}/',p): return None
    if not p: return '#wiki'
    if p.endswith('.html'): p=p[:-5]
    if p.endswith('/index'): p=p[:-6]
    if '..' in p.split('/'): return None
    return '#wiki/'+quote(p, safe='/-_')

class Sanitizer(HTMLParser):
    def __init__(self, page: Path, root: Path, slug: str):
        super().__init__(convert_charrefs=True)
        self.page,self.root,self.slug=page,root,slug
        self.out=[]
        self.open=[]
        self.skip=0
        self.images=0
        self.missing_images=0
        self.links=0
    def handle_starttag(self,tag,attrs):
        tag=tag.lower()
        if tag in SKIP:
            self.skip+=1
            return
        if self.skip: return
        if tag not in ALLOWED: return
        attrs=dict(attrs)
        attr=''
        if tag=='a':
            dest=normalized_internal(attrs.get('href') or '',self.slug)
            if dest:
                attr=' href="'+escape(dest,quote=True)+'"'
                self.links+=1
            else:
                # Leave non-wiki links as plain text, never navigate outside.
                tag='span'
        if tag=='img':
            src=(attrs.get('src') or '').strip()
            alt=attrs.get('alt') or ''
            local=self.import_image(src)
            if not local:
                self.missing_images+=1
                if alt: self.out.append('<span class="wiki-missing-img">'+escape(alt)+'</span>')
                return
            attr=' src="'+escape(local,quote=True)+'" alt="'+escape(alt,quote=True)+'" loading="lazy" decoding="async"'
            self.images+=1
        if tag=='th' and attrs.get('scope') in {'row','col'}:
            attr=' scope="'+attrs['scope']+'"'
        self.out.append('<'+tag+attr+'>')
        if tag not in VOID: self.open.append(tag)
    def import_image(self,url: str) -> str | None:
        if not url or url.startswith(('data:','//')): return None
        parts=urlsplit(url)
        # Solo immagini originali verificabili, mai sostituti grafici generati.
        if parts.scheme in {'http','https'}:
            if parts.scheme!='https': return None
            host=parts.hostname or ''
            path=unquote(parts.path)
            is_icon=host=='images.verzum.to' and bool(re.fullmatch(r'/item/[0-9]+[.]png',path))
            is_wiki_image=host=='wiki.verzum.to' and path.startswith(('/img/','/assets/'))
            if not (is_icon or is_wiki_image): return None
            original='https://'+host+path
            basename=path.rsplit('/',1)[-1]
            ext=Path(basename).suffix.lower()
            if ext not in IMG_TYPES:return None
            # Salva i bytes originali, senza ridimensionare, ricolorare o ricreare.
            try:
                req=Request(original,headers={'User-Agent':'VERZUM-Wiki-Import/1.0'})
                with urlopen(req,timeout=12) as resp:
                    mime=resp.headers.get('content-type','').lower().split(';')[0]
                    if not mime.startswith('image/'):raise ValueError('Risposta non immagine')
                    data=resp.read(8_000_001)
                if not data or len(data)>8_000_000:raise ValueError('Immagine troppo grande')
                if ext=='.png' and not data.startswith(b'\x89PNG\r\n\x1a\n'):raise ValueError('PNG non valido')
                if ext=='.webp' and not (data.startswith(b'RIFF') and data[8:12]==b'WEBP'):raise ValueError('WebP non valido')
                hashname=hashlib.sha256(data).hexdigest()[:20]+ext
                DEST.mkdir(parents=True,exist_ok=True)
                target=DEST/hashname
                if not target.exists():target.write_bytes(data)
                return 'wiki-assets/'+hashname
            except (OSError,ValueError):
                # Se il download fallisce conserva solo URL originale esplicitamente verificato.
                return original
        src=unquote(parts.path)
        if src.startswith('/'): candidate=self.root/src.lstrip('/')
        else: candidate=self.page.parent/src
        try:
            candidate=candidate.resolve(strict=True)
            candidate.relative_to(self.root.resolve())
        except (OSError,ValueError): return None
        if candidate.suffix.lower() not in IMG_TYPES or not candidate.is_file(): return None
        if candidate.stat().st_size > 8_000_000: return None
        data=candidate.read_bytes()
        name=hashlib.sha256(data).hexdigest()[:20]+candidate.suffix.lower()
        DEST.mkdir(parents=True,exist_ok=True)
        out=DEST/name
        if not out.exists(): out.write_bytes(data)
        return 'wiki-assets/'+name
    def handle_endtag(self,tag):
        tag=tag.lower()
        if tag in SKIP:
            if self.skip: self.skip-=1
            return
        if self.skip or tag not in ALLOWED or tag in VOID: return
        if tag in self.open:
            while self.open:
                last=self.open.pop()
                self.out.append('</'+last+'>')
                if last==tag: break
    def handle_data(self,data):
        if not self.skip: self.out.append(escape(data))
    def handle_entityref(self,name):
        if not self.skip:self.out.append('&'+name+';')
    def handle_charref(self,name):
        if not self.skip:self.out.append('&#'+name+';')
    def result(self):
        while self.open:self.out.append('</'+self.open.pop()+'>')
        return ''.join(self.out)

def extracted_zip(zip_path: Path,temp: Path) -> Path:
    total=0
    with zipfile.ZipFile(zip_path) as z:
        for info in z.infolist():
            if info.is_dir(): continue
            total+=info.file_size
            if total>350_000_000: raise ValueError('Archivio troppo grande (massimo 350 MB)')
            p=Path(info.filename)
            if p.is_absolute() or '..' in p.parts: continue
            if not (p.suffix.lower() in IMG_TYPES or p.suffix.lower() in {'.html','.htm'}):continue
            dest=temp/p
            dest.parent.mkdir(parents=True,exist_ok=True)
            with z.open(info) as src, dest.open('wb') as dst:
                shutil.copyfileobj(src,dst)
    return temp

def run(source: Path):
    with tempfile.TemporaryDirectory() as tmp:
        root=extracted_zip(source,Path(tmp)) if source.is_file() and source.suffix.lower()=='.zip' else source
        if not root.is_dir():raise ValueError('Specificare una cartella HTML oppure uno ZIP')
        htmls=sorted([*root.rglob('*.html'),*root.rglob('*.htm')])
        if not htmls:raise ValueError('Nessuna pagina HTML presente nell’esportazione')
        pages={}
        linked=images=missing=0
        for html_file in htmls:
            slug=page_slug(html_file,root)
            if slug in pages or len(slug)>220:continue
            raw=html_file.read_text(encoding='utf-8',errors='replace')
            parser=Sanitizer(html_file,root,slug)
            parser.feed(main_area(raw))
            rendered=parser.result()
            if len(rendered.strip())<8:continue
            pages[slug]={
                'title':page_title(raw,slug.split('/')[-1]),
                'group':GROUPS.get(slug.split('/')[0],'Wiki'),
                'html':rendered
            }
            linked+=parser.links
            images+=parser.images
            missing+=parser.missing_images
        if not pages:raise ValueError('Nessuna pagina utilizzabile')
        payload=json.dumps(pages,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
        OUTPUT.write_text('/* Esportazione HTML autorizzata — contenuti sanificati. */\nwindow.VERZUM_WIKI_DATA='+payload+';\n',encoding='utf-8')
        print(f'Importate: {len(pages)} pagine; {linked} link interni; {images} immagini locali; {missing} immagini non incluse.')
        print(f'Generato: {OUTPUT.relative_to(BASE.parent)}')
        print('Verifica i contenuti e pubblica public/wiki-data.generated.js e public/wiki-assets/')

if __name__=='__main__':
    if len(sys.argv)!=2:
        print('Uso: python scripts/importa_wiki.py <cartella-html-o-zip>',file=sys.stderr)
        sys.exit(2)
    try:run(Path(sys.argv[1]).expanduser().resolve())
    except (OSError,ValueError,zipfile.BadZipFile) as exc:
        print('Importazione non riuscita:',exc,file=sys.stderr)
        sys.exit(1)
