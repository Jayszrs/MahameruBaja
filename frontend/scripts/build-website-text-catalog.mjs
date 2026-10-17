// Generate editor choices from existing copy; never rewrite page/component source.
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicComponents = new Set(['Navbar','Footer','UnifiedHomeContent','HeroCarousel','Promotions','ProjectAlbums','ContactDirectory','DivisionLocation','DivisionVision','SocialHub','SocialProof','QuotationDrawer','SearchOverlay','ProductCard','RequestHandoff','EventCountdown','DivisionCollage','WelcomePosters']);
const rows = new Map();
const normalize = text => text.replace(/\s+/g, ' ').trim();
function add(source, area) {
  source = normalize(source);
  if (source.length < 3 || source.length > 5000 || !/[a-zA-Z]/.test(source) || /^(?:https?:|\/|#[\w-]|[a-z]+:)/.test(source)) return;
  if (!rows.has(source)) rows.set(source, { source, area });
}
const dataFiles=new Set(['heroSlides.ts','divisionContent.ts','divisionAbout.ts','companyIdentity.ts','serviceDescriptions.ts']);
for (const directory of ['screens','components','data']) {
  for (const file of await fs.readdir(path.join(frontend, 'src', directory))) {
    if (directory==='data' ? !dataFiles.has(file) : !file.endsWith('.tsx') || directory === 'components' && !publicComponents.has(file.slice(0,-4)) || ['OperationsDemoPage.tsx','AboutPage.tsx','ServicesPage.tsx'].includes(file)) continue;
    const source = ts.createSourceFile(file, await fs.readFile(path.join(frontend,'src',directory,file),'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxText(node)) add(node.text, file.slice(0,-4));
      if (ts.isStringLiteral(node)) {
        let parent = node.parent;
        const attribute = ts.isJsxAttribute(parent) ? parent.name.getText(source) : '';
        if (['placeholder','title'].includes(attribute)) add(node.text, file.slice(0,-4));
        if (ts.isPropertyAssignment(parent) && /^(title|accent|eyebrow|intro|description|mission|headline|aboutHeadline|desc|detail|text|action|label|name|question|answer)$/.test(parent.name.getText(source)) && (node.text.includes(' ') || /^[A-Z]/.test(node.text))) add(node.text,file.replace(/\.tsx?$/,''));
        if(directory==='data' && ts.isReturnStatement(parent) && node.text.includes(' '))add(node.text,file.replace(/\.tsx?$/,''));
        while (parent && !ts.isJsxAttribute(parent) && !ts.isStatement(parent) && !ts.isVariableDeclaration(parent)) {
          if (ts.isJsxExpression(parent) && !ts.isJsxAttribute(parent.parent)) { if (!/^(?:[a-z0-9_-]+|\s*)$/.test(node.text)) add(node.text,file.slice(0,-4)); break; }
          parent = parent.parent;
        }
      }
      ts.forEachChild(node,visit);
    }
    visit(source);
  }
}
const result = [...rows.values()].sort((a,b) => a.area.localeCompare(b.area) || a.source.localeCompare(b.source,'id'));
await fs.writeFile(path.join(frontend,'src/data/websiteTextCatalog.json'), JSON.stringify(result,null,2) + '\n');
console.log(`Generated ${result.length} text choices from public UI. No UI source changed.`);
