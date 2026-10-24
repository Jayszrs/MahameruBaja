import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';import ts from 'typescript';
const require=createRequire(import.meta.url),frontend=fileURLToPath(new URL('../',import.meta.url)),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const localRequire=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts')):require(name);const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports',js)(localRequire,module,module.exports);return module.exports;}
const {applyManualOrder}=load(path.join(frontend,'src/lib/recordOrder.ts'));
const foreign={id:'b',owner:'b',revision:4,title:'Other division',nested:{published:false}};
const rows=[{id:'a1',owner:'a',revision:1},foreign,{id:'a2',owner:'a',revision:2}];const canEdit=row=>row.owner==='a';
const expected=applyManualOrder(rows,[{id:'a2',revision:2},{id:'a1',revision:1}],canEdit);
assert.deepEqual(expected.map(row=>row.id),['a2','b','a1']);assert.equal(expected[1],foreign);assert.equal(foreign.sortOrder,undefined);assert.equal(expected[0].revision,3);assert.equal(expected[2].revision,2);
assert.equal(applyManualOrder(rows,[{id:'a1',revision:1},{id:'a2',revision:2}],canEdit),rows);assert.equal(applyManualOrder(rows,[],()=>false),rows);
for(const [requested,status] of [[[{id:'a1',revision:0},{id:'a2',revision:2}],409],[[{id:'a1',revision:1}],409],[[{id:'a1',revision:1},{id:'a1',revision:1}],400],[[{id:'b',revision:4},{id:'a1',revision:1}],403]])assert.throws(()=>applyManualOrder(rows,requested,canEdit),error=>error.status===status);
const {orderedArticles}=load(path.join(frontend,'src/data/articleCms.ts'));
const legacy=[{id:'old',date:'2020-01-01'},{id:'new',date:'2026-10-24'}];assert.equal(orderedArticles(legacy)[0].id,'new');const manual=[{...legacy[0],sortOrder:0},legacy[1]];assert.deepEqual(orderedArticles(manual),manual);
console.log('PASS manual-order model: scoped slots, foreign object/data unchanged, empty/no-op unchanged, revisions/conflicts/duplicates/scope guards, legacy chronology and persisted manual article array.');
