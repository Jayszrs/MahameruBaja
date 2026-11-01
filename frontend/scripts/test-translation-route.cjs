const assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const {createRequire}=require('node:module');const localRequire=createRequire(process.cwd()+'/frontend/package.json');const {NextRequest}=localRequire('next/server');
const code=ts.transpileModule(fs.readFileSync('frontend/app/api/translate/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let calls=[];function route(key='private-test-key'){const module={exports:{}};vm.runInNewContext(code,{require:localRequire,module,exports:module.exports,process:{env:{GOOGLE_TRANSLATE_API_KEY:key}},fetch:async(url,options)=>{calls.push({url,options});const body=JSON.parse(options.body);return Response.json({data:{translations:body.q.map(text=>({translatedText:'English '+text}))}});},Response,AbortSignal,Date,Map,Set,Number,JSON});return module.exports.POST;}
const request=(body,origin='http://localhost:3110')=>new NextRequest('http://localhost:3110/api/translate',{method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':'127.0.0.1'},body:JSON.stringify(body)});
(async()=>{const post=route();let res=await post(request({language:'en',texts:['Beranda','Galeri']}));assert.equal(res.status,200);assert.deepEqual((await res.json()).translations,['English Beranda','English Galeri']);assert.equal(calls.length,1);assert.equal(calls[0].options.headers['X-goog-api-key'],'private-test-key');
res=await post(request({language:'en',texts:['Beranda']}));assert.equal(res.status,200);assert.equal(calls.length,1);assert.equal(res.headers.get('cache-control'),'no-store');
assert.equal((await post(request({language:'en',texts:['Beranda']},'https://another.example'))).status,403);
assert.equal((await post(request({language:'invalid',texts:['Beranda']}))).status,400);
assert.equal((await post(request({language:'en',texts:['a'.repeat(12001)]}))).status,400);
assert.equal((await route('')(request({language:'en',texts:['Beranda']}))).status,503);
for(let count=0;count<35;count++)res=await post(request({language:'en',texts:['Beranda']}));assert.equal(res.status,429);assert.equal(calls.length,1);
console.log('Translation route passed: provider contract, server-only key, warm cache, origin, validation, missing credentials, no-store and rate limit. No external requests sent.');})().catch(error=>{console.error(error);process.exit(1)});
