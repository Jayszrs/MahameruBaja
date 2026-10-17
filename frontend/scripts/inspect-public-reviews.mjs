// Read public deployment payloads only; never execute script contents.
import { pathToFileURL } from 'node:url';

export async function publicReviewProfiles(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Public source returned HTTP ${response.status}`);
  const html=await response.text();const chunks=[];
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    const push=/self\.__next_f\.push\(([\s\S]+)\)/.exec(script[1]);
    if (!push) continue;
    try {const data=JSON.parse(push[1]);if(data[0]===1 && typeof data[1]==='string')chunks.push(data[1]);}catch{}
  }
  const profiles=[];const seen=new Set();
  function visit(value) {
    if(!value || typeof value!=='object')return;
    if(Array.isArray(value.reviews) && typeof value.rating==='number' && typeof value.mapsUrl==='string' && value.reviews.every(r=>r && typeof r.id==='string' && typeof r.author==='string' && typeof r.text==='string')) {
      const fingerprint=JSON.stringify([value.mapsUrl,value.rating,value.reviewCount,value.reviews.map(r=>r.id)]);
      if(!seen.has(fingerprint)){seen.add(fingerprint);profiles.push({rating:value.rating,reviewCount:value.reviewCount??null,ratingDate:value.ratingDate || '',mapsUrl:value.mapsUrl,reviews:value.reviews});}
    }
    for(const child of Object.values(value))visit(child);
  }
  for(const line of chunks.join('').split('\n')) {
    const json=line.slice(line.indexOf(':')+1);
    if(!/^[\[{]/.test(json))continue;
    try{visit(JSON.parse(json));}catch{}
  }
  return {url,status:response.status,profiles};
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  for(const url of process.argv.slice(2)) {
    const result=await publicReviewProfiles(url);
    console.log(JSON.stringify({...result,profiles:result.profiles.map(p=>({rating:p.rating,reviewCount:p.reviewCount,ratingDate:p.ratingDate,mapsUrl:p.mapsUrl,loadedReviews:p.reviews.length}))}));
  }
}
