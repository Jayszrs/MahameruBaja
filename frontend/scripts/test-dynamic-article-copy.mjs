import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const frontend = fileURLToPath(new URL('../', import.meta.url));
const modules = new Map(); let pathname = '/informasi/artikel-baru';
function load(filename) {
  const file = path.resolve(filename);
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} }; modules.set(file, module);
  const localRequire = name => {
    if (name === 'server-only') return {};
    if (name === 'next/navigation') return { usePathname: () => pathname };
    if (!name.startsWith('.')) return require(name);
    const base = path.resolve(path.dirname(file), name);
    return load(base + (fs.existsSync(base + '.ts') ? '.ts' : '.tsx'));
  };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  new Function('require', 'module', 'exports', source)(localRequire, module, module.exports);
  return module.exports;
}
const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
const { articleWebsiteTextChoices } = load(path.join(frontend, 'src/lib/articleWebsiteTextCatalog.ts'));
const { choicesForWebsite, choiceOnPage } = load(path.join(frontend, 'src/data/websiteTextChoices.ts'));
const { articleTextSegments } = load(path.join(frontend, 'src/data/articleWebsiteText.ts'));
const { default: PublicText, WebsiteTextProvider, WebsiteTextScope } = load(path.join(frontend, 'src/components/PublicText.tsx'));
const { default: ArticleContent } = load(path.join(frontend, 'src/components/ArticleContent.tsx'));
const markdown = '## Judul bagian terkini\n\nParagraf **tebal** dan [tautan](https://example.com/proyek?q=plat) dengan `kode rahasia` serta &amp;.\n\n| Jenis | Ukuran |\n| --- | --- |\n| Baja khusus | Sepuluh |\n\n<script>jangan jalankan</script>';
const article = { title: 'Judul artikel CMS terkini', excerpt: 'Ringkasan artikel CMS terkini', category: 'Kategori khusus', readTime: '1 mnt baca', content: markdown, ownerDivision: 'retail-tambun' };
const mainArticle = { ...article, ownerDivision: null, title: 'Artikel milik pusat', content: 'Tulisan pusat.' };
const catalog = articleWebsiteTextChoices([article, mainArticle]);
for (const source of [article.title, article.excerpt, article.category, 'Judul bagian terkini', 'Paragraf', 'tebal', 'tautan', 'Jenis', 'Ukuran', 'Baja khusus']) {
  assert(catalog.some(choice => choice.source === source && choice.ownerDivision === 'retail-tambun'), source);
}
for (const hidden of ['kode rahasia', 'https://example.com/proyek?q=plat', 'jangan jalankan']) assert(!catalog.some(choice => choice.source.includes(hidden)));
const main = choicesForWebsite([], undefined, [], [], undefined, [], catalog);
assert(main.some(choice => choice.source === mainArticle.title)); assert(!main.some(choice => choice.source === article.title));
const division = { slug: 'retail-tambun', values: [], offerings: [], process: [], offeringDescriptions: {}, faq: [], images: [], primary: {} };
const owned = choicesForWebsite([], division, [], [], undefined, [], catalog);
assert(owned.some(choice => choice.source === article.title && choiceOnPage(choice, 'articles')));
assert(!owned.some(choice => choice.source === mainArticle.title));
const social = choicesForWebsite([], undefined, [], [], { socialAccounts: [{ handle: '@nama_kanal_terkini' }], inventory: [] });
assert(social.some(choice => choice.source === '@nama_kanal_terkini' && choiceOnPage(choice, 'social')));

const row = (source, replacement, ownerDivision = 'retail-tambun', page = 'articles') => ({ id: source + ownerDivision + page, source, replacement, ownerDivision, page, published: true });
const rows = [row('Paragraf', 'Kalimat'), row('tebal', '<img src=x onerror=alert(1)>'), row('tautan', 'Hubungi kami'), row('kode rahasia', 'JANGAN UBAH KODE'), row('Judul artikel CMS terkini', 'Judul milik divisi'), row('Judul artikel CMS terkini', 'JANGAN PAKAI PUSAT', null), row('Ukuran', 'Dimensi'), row('Jenis', 'Jenis umum', 'retail-tambun', 'all'), row('Jenis', 'Jenis artikel')];
function render(owner, textRows = rows) {
  return renderToStaticMarkup(React.createElement(WebsiteTextProvider, { texts: textRows },
    React.createElement(PublicText, null, React.createElement(WebsiteTextScope, { ownerDivision: owner },
      React.createElement(React.Fragment, null,
        React.createElement(PublicText, null, React.createElement('h1', null, article.title)),
        React.createElement(ArticleContent, { content: markdown }))))));
}
const html = render('retail-tambun');
assert(html.includes('Judul milik divisi') && !html.includes('JANGAN PAKAI PUSAT'));
assert(html.includes('Kalimat <strong>'), 'Spacing around formatted text survives replacement.');
assert(html.includes('&lt;img src=x onerror=alert(1)&gt;') && !html.includes('<img src="x"'), 'Replacement is text, never parsed as HTML.');
assert(html.includes('href="https://example.com/proyek?q=plat"') && html.includes('Hubungi kami'));
assert(html.includes('<code>kode rahasia</code>') && !html.includes('JANGAN UBAH KODE'));
assert(html.includes('Dimensi') && html.includes('Jenis artikel') && !html.includes('Jenis umum'));
assert(!html.includes('<script>') && !html.includes('jangan jalankan'));
const other = render('retail-cibitung'); assert(other.includes(article.title) && !other.includes('Judul milik divisi'));
const cascade = render('retail-tambun', [row('tebal', 'tautan'), row('tautan', 'Tujuan lain')]);
assert(cascade.includes('<strong>tautan</strong>'), 'Replacements run once across an explicit ownership boundary.');
pathname = '/admin/artikel'; const preview = render('retail-tambun');
assert(preview.includes(article.title) && preview.includes('<strong>tebal</strong>') && !preview.includes('Judul milik divisi'));
const long = 'Keterangan '.repeat(1200), segments = articleTextSegments(long);
assert.equal(segments.join(''), long); assert(segments.every(segment => segment.trim().length <= 5000));
console.log('PASS: current article metadata/Markdown/GFM table text and social handles are discoverable; scoped single-pass replacements preserve whitespace, formatting, links, code, safe HTML, page priority, and admin previews.');
