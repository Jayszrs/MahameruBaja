// Disposable local server only. Explicitly disables Vercel Blob and never reads live CMS credentials.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {randomBytes,scryptSync} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const frontend=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.dirname(frontend);
await mkdir(path.join(root,'tmp'),{recursive:true});
const directory=await mkdtemp(path.join(root,'tmp','cms-all-roles-'));
const origin='http://localhost:3173';
const hash=password=>{const salt=randomBytes(16).toString('hex');return `scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;};
const accounts=[{email:'division-a@example.test',division:'retail-tambun',passwordHash:hash('division-fixture-a')},{email:'division-b@example.test',division:'retail-cibitung',passwordHash:hash('division-fixture-b')},...['trading-proyek','laser-cutting','fabrikasi-erection'].map(division=>({email:`qa.${division}@example.test`,division,passwordHash:hash('division-fixture-a')}))];
const env={...process.env,CMS_DATA_DIR:directory,BLOB_READ_WRITE_TOKEN:'',VERCEL:'',ADMIN_EMAIL:'cms-test@example.test',ADMIN_PASSWORD_HASH:hash('article-test-local'),ADMIN_ACCOUNTS_JSON:JSON.stringify(accounts),ADMIN_SESSION_SECRET:randomBytes(32).toString('hex'),ARTICLE_TEST_ISOLATED:'1',ARTICLE_TEST_URL:origin,CMS_TEST_ARTIFACTS_DIR:directory,CMS_MEDIA_TEST_DATA_DIR:directory,CMS_TEST_ALL_DIVISIONS:'1'};
let server,logs='';
async function start(){
  let ready=false;
  server=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','-p','3173'],{cwd:frontend,windowsHide:true,env,stdio:['ignore','pipe','pipe']});
  server.stdout.on('data',b=>{logs+=b;if(/Ready in/.test(String(b)))ready=true;});server.stderr.on('data',b=>logs+=b);
  for(let i=0;i<80;i++){
    assert.equal(server.exitCode,null,'Our fixture server exited; do not test another service on the same port');
    if(ready)try{if((await fetch(origin+'/admin/login',{signal:AbortSignal.timeout(3000)})).status===200)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw new Error('Isolated server did not start');
}
async function stop(){if(!server||server.exitCode!==null)return;const done=new Promise(resolve=>server.once('exit',resolve));server.kill();await done;}
async function suite(file,args=[]){const child=spawn(process.execPath,[path.join(frontend,'scripts',file),...args],{cwd:root,windowsHide:true,env,stdio:['ignore','pipe','pipe']});child.stdout.on('data',b=>process.stdout.write(b));child.stderr.on('data',b=>process.stderr.write(b));assert.equal(await new Promise(resolve=>child.once('exit',resolve)),0,`Failed suite ${file} ${args.join(' ')}`);}
try{
  await start();
  if(process.argv.includes('--empty')){
    await suite('test-cms-crud.mjs',['--empty']);
  }else if(process.argv.includes('--uploads')){
    await suite('test-media-uploads.mjs');await stop();await start();await suite('test-media-uploads.mjs',['--after-restart']);
  }else if(process.argv.includes('--accounts')){
    await suite('test-divisions-accounts.mjs');await stop();await start();await suite('test-divisions-accounts.mjs',['--after-restart']);
  }else{
    await suite('test-cms-crud.mjs');
    await stop();await start();
    await suite('test-cms-crud.mjs',['--after-restart']);
    await suite('test-articles.mjs');
    await suite('test-cms-crud.mjs',['--empty']);
  }
  console.log(`PASS: ${process.argv.includes('--empty')?'empty-state persistence':process.argv.includes('--uploads')?'media uploads and restart persistence':process.argv.includes('--accounts')?'division/account administration and restart persistence':'all-role content/article CRUD, empty states and restart persistence'}. Local artifacts: ${directory}`);
}catch(error){console.error(logs.slice(-5000));throw error;}finally{await stop();}
