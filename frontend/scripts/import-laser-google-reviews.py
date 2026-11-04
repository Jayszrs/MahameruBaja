"""Import public review data from the owner's saved Google Search HTML; never execute it."""
import argparse
import hashlib
import html
import json
import re
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def text(self):
        return ''.join(child if isinstance(child, str) else child.text() for child in self.children)
    def has_class(self, name):
        return name in self.attrs.get('class', '').split()
    def nodes(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.nodes()

class Document(HTMLParser):
    void = {'meta','link','img','input','br','hr','area','base','embed','source','track','wbr'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node('root', [], None)
    def handle_starttag(self, tag, attrs):
        if tag == 'br':
            self.current.children.append('\n')
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in self.void:
            self.current = node
    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent
    def handle_data(self, value):
        self.current.children.append(value)

def clean(value):
    return re.sub(r'\s+', ' ', value).strip()

def extract(source, captured):
    visible = html.unescape(re.sub('<[^>]+>', ' ', re.sub(r'<(script|style)\b[^>]*>.*?</\1>', ' ', source, flags=re.S|re.I)))
    summary = re.search(r'MBI\s+LASER\s+CUTTING\s+([0-5][,.]\d)\s+(\d+)\s+ulasan\s+Google', clean(visible))
    fid = re.search(r'data-(?:fid|ludocid)="0x[0-9a-f]+:(0x[0-9a-f]+)"', source)
    if not summary or not fid:
        raise ValueError('MBI Laser Cutting rating, count, or business ID was not found; no output changed.')
    maps_url = 'https://www.google.com/maps?cid=' + str(int(fid[1],16))
    document = Document(); document.feed(source)
    reviews = []
    for author in [node for node in document.root.nodes() if node.has_class('rhtdWc')]:
        card = author
        while card.parent and not any(node.has_class('h3PQJ') for node in card.nodes()):
            card = card.parent
        nodes = list(card.nodes())
        ids = {node.attrs['data-review-id'] for node in nodes if 'data-review-id' in node.attrs}
        if len(ids) != 1:
            raise ValueError('Review card does not have exactly one unique review ID.')
        texts = [clean(node.text()) for node in nodes if node.has_class('d83Iyc')]
        # Expanded full text follows the collapsed "Lebih banyak" copy.
        text = texts[-1] if texts else ''
        stars = next(node for node in nodes if node.has_class('h3PQJ'))
        rating = sum(1 for node in stars.nodes() if node.tag == 'svg' and any(child.attrs.get('fill') == '#fabb05' for child in node.nodes()))
        if rating not in range(1,6) or len(text) > 2000:
            raise ValueError('Review rating or length needs manual inspection; no text was truncated.')
        author_url = next((node.attrs.get('href','') for node in nodes if node.tag == 'a' and node.attrs.get('href','').startswith('https://www.google.com/maps/contrib/')), '')
        avatar = next((node for node in nodes if node.has_class('QNewyd')), None)
        photo = re.search(r'url\(["\']?(https://[^"\')]+)', avatar.attrs.get('style','')) if avatar else None
        review = dict(id='laser-google-'+hashlib.sha256(next(iter(ids)).encode()).hexdigest()[:20], ownerDivision='laser-cutting', audience=['laser-cutting'], author=clean(author.text()), rating=rating, text=text, when=next((clean(node.text()) for node in nodes if node.has_class('m6Mr5d')), ''), url=maps_url, published=True)
        if not text:
            review['ratingOnly'] = True
        if author_url.startswith('https://www.google.com/maps/contrib/'):
            review['authorUrl'] = author_url
        if photo and urlparse(photo[1]).hostname.endswith('.googleusercontent.com'):
            review['authorPhoto'] = photo[1]
        reviews.append(review)
    if len({review['id'] for review in reviews}) != len(reviews):
        raise ValueError('Duplicate review IDs were found.')
    count = int(summary[2])
    if len(reviews) != count:
        raise ValueError(f'Snapshot contains {len(reviews)} full cards but its summary says {count}; save all reviews before importing.')
    months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    date = datetime.fromisoformat(captured)
    return dict(rating=float(summary[1].replace(',','.')), reviewCount=count, ratingDate=f'{date.day} {months[date.month-1]} {date.year}', mapsUrl=maps_url, reviews=reviews)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('snapshot',type=Path); parser.add_argument('--date',default=datetime.now(timezone(timedelta(hours=7))).date().isoformat())
    args = parser.parse_args(); source = args.snapshot.read_text(encoding='utf-8'); profile = extract(source,args.date)
    frontend = Path(__file__).resolve().parents[1]
    (frontend/'src/data/laserGoogleReviews.ts').write_text('import type { ReviewContent } from "./siteContent";\n\nexport const laserGoogleReviews: ReviewContent = '+json.dumps(profile,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    proof = dict(sourceFile=args.snapshot.name,sha256=hashlib.sha256(source.encode()).hexdigest(),capturedAt=args.date,rating=profile['rating'],reviewCount=profile['reviewCount'],comments=sum(bool(row['text']) for row in profile['reviews']),ratingOnly=sum(not row['text'] for row in profile['reviews']),mapsUrl=profile['mapsUrl'])
    (frontend/'data/laser-google-reviews-source.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(proof,ensure_ascii=True))
