// Generate editor choices from existing copy; never rewrite page/component source.
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicComponents = new Set(['Navbar','Footer','UnifiedHomeContent','HeroCarousel','Promotions','ProjectAlbums','ContactDirectory','DivisionLocation','DivisionVision','SocialHub','SocialProof','QuotationDrawer','SearchOverlay','ProductCard','RequestHandoff','EventCountdown','DivisionCollage','WelcomePosters']);
for(const name of ['ShareArticle','RequestPhotoInput','PhotoGalleryDialog','ProductInventory','HorizontalRibbons','WhatsAppButton','RequestFields','FooterDivisions'])publicComponents.add(name);
const rows = new Map();
const normalize = text => text.replace(/\s+/g, ' ').trim();
function add(source, area) {
  source = normalize(source);
  if (source.length < 3 || source.length > 5000 || !/[a-zA-Z]/.test(source) || /^(?:https?:|\/|#[\w-]|[a-z]+:)/.test(source)) return;
  const existing=rows.get(source);
  if (!existing) rows.set(source, { source, area });
  else if(existing.area!==area)existing.areas=[...new Set([...(existing.areas || [existing.area]),area])];
}
const dataFiles=new Set(['heroSlides.ts','divisionContent.ts','divisionAbout.ts','companyIdentity.ts','serviceDescriptions.ts','divisionLocations.ts','products.ts','categories.ts','business.ts','articles.ts','clientPosters.ts','promotions.ts','projectGallery.ts','serviceContent.ts','socialMedia.ts','unitSections.ts']);
const displayFields=new Set(['title','accent','eyebrow','intro','description','mission','headline','aboutHeadline','desc','detail','text','action','label','name','question','answer','shortSpec','summary','excerpt','caption','benefit','terms','ctaLabel','values','offerings','process','usages','messages','category','value','visualNote']);
for (const directory of ['screens','components','data','../app/kebijakan-privasi','../app/syarat-ketentuan','../app/galeri']) {
  for (const file of await fs.readdir(path.join(frontend, 'src', directory))) {
    if (directory==='data' ? !dataFiles.has(file) : !file.endsWith('.tsx') || directory === 'components' && !publicComponents.has(file.slice(0,-4)) || ['OperationsDemoPage.tsx','AboutPage.tsx','ServicesPage.tsx'].includes(file)) continue;
    const source = ts.createSourceFile(file, await fs.readFile(path.join(frontend,'src',directory,file),'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxText(node)) add(node.text, directory === '../app/galeri' ? 'GalleryPage' : directory.startsWith('../app/') ? 'Legal' : file.slice(0,-4));
      if (ts.isStringLiteral(node)) {
        let parent = node.parent;
        const attribute = ts.isJsxAttribute(parent) ? parent.name.getText(source) : '';
        if (['placeholder','title'].includes(attribute)) add(node.text, file.slice(0,-4));
        if (ts.isPropertyAssignment(parent) && displayFields.has(parent.name.getText(source).replace(/^['"]|['"]$/g,''))) add(node.text,file.replace(/\.tsx?$/,''));
        if(directory==='data' && ts.isArrayLiteralExpression(parent)) {
          let container=parent.parent;
          if(ts.isPropertyAssignment(container) && displayFields.has(container.name.getText(source).replace(/^['"]|['"]$/g,'')))add(node.text,file.replace(/\.tsx?$/,''));
        }
        if(directory==='data' && ts.isReturnStatement(parent) && node.text.includes(' '))add(node.text,file.replace(/\.tsx?$/,''));
        while (parent && !ts.isJsxAttribute(parent) && !ts.isStatement(parent) && !ts.isVariableDeclaration(parent)) {
          if (ts.isJsxExpression(parent) && !ts.isJsxAttribute(parent.parent)) { if (!/^(?:[a-z0-9_-]+|\s*)$/.test(node.text)) add(node.text,file.slice(0,-4)); break; }
          parent = parent.parent;
        }
        if(parent && ts.isVariableDeclaration(parent) && /^(title|headline|intro|description|text)$/.test(parent.name.getText(source)) && node.text.includes(' '))add(node.text,file.replace(/\.tsx?$/,''));
      }
      ts.forEachChild(node,visit);
    }
    visit(source);
  }
}
const result = [...rows.values()].sort((a,b) => a.area.localeCompare(b.area) || a.source.localeCompare(b.source,'id'));
await fs.writeFile(path.join(frontend,'src/data/websiteTextCatalog.json'), JSON.stringify(result,null,2) + '\n');
console.log(`Generated ${result.length} text choices from public UI. No UI source changed.`);
