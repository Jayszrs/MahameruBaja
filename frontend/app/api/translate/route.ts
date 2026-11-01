import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const schema=z.object({language:z.enum(["en","zh-CN"]),texts:z.array(z.string().trim().min(1).max(12000)).min(1).max(60)}).refine(value=>value.texts.reduce((sum,text)=>sum+text.length,0)<=12000);
const translations=new Map<string,string>();
const requests=new Map<string,{start:number;count:number}>();
let budget={start:Date.now(),characters:0};
export async function POST(request:NextRequest){
 const headers={"Cache-Control":"no-store"};
 const origin=request.headers.get("origin");
 if(!origin||origin!==request.nextUrl.origin)return NextResponse.json({message:"Sumber permintaan tidak valid."},{status:403,headers});
 if(Number(request.headers.get("content-length")||0)>70000)return NextResponse.json({message:"Teks terlalu panjang."},{status:413,headers});
 const key=process.env.GOOGLE_TRANSLATE_API_KEY;
 if(!key)return NextResponse.json({message:"Pilihan bahasa belum tersedia. Silakan gunakan Bahasa Indonesia."},{status:503,headers});
 const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";const now=Date.now();
 if(requests.size>5000)for(const [id,value]of requests)if(now-value.start>60000)requests.delete(id);
 const counter=requests.get(ip);if(counter&&now-counter.start<60000&&counter.count>=30)return NextResponse.json({message:"Tunggu sebentar sebelum menerjemahkan lagi."},{status:429,headers});
 requests.set(ip,counter&&now-counter.start<60000?{...counter,count:counter.count+1}:{start:now,count:1});
 let raw:unknown;try{const body=await request.text();if(body.length>70000)return NextResponse.json({message:"Teks terlalu panjang."},{status:413,headers});raw=JSON.parse(body);}catch{return NextResponse.json({message:"Permintaan tidak valid."},{status:400,headers});}
 const parsed=schema.safeParse(raw);if(!parsed.success)return NextResponse.json({message:"Permintaan terjemahan tidak valid."},{status:400,headers});
 const {language,texts}=parsed.data;const missing=[...new Set(texts)].filter(text=>!translations.has(`${language}:${text}`));
 const characters=missing.reduce((sum,text)=>sum+text.length,0);if(now-budget.start>3600000)budget={start:now,characters:0};
 const limit=Number(process.env.TRANSLATE_HOURLY_CHARACTER_LIMIT||200000);
 if(budget.characters+characters>limit)return NextResponse.json({message:"Terjemahan sedang penuh. Coba lagi nanti."},{status:429,headers});
 try{
  if(missing.length){
   budget.characters+=characters;
   const response=await fetch("https://translation.googleapis.com/language/translate/v2",{method:"POST",headers:{"Content-Type":"application/json","X-goog-api-key":key},body:JSON.stringify({q:missing,source:"id",target:language,format:"text"}),signal:AbortSignal.timeout(15000),cache:"no-store"});
   if(!response.ok)throw new Error("Translation provider unavailable");
   const data=await response.json();const result=data.data?.translations;
   if(!Array.isArray(result)||result.length!==missing.length||result.some(row=>typeof row.translatedText!=="string"))throw new Error("Invalid provider response");
   if(translations.size>12000)translations.clear();
   missing.forEach((text,index)=>translations.set(`${language}:${text}`,result[index].translatedText));
  }
  return NextResponse.json({translations:texts.map(text=>translations.get(`${language}:${text}`))},{headers});
 }catch{return NextResponse.json({message:"Terjemahan belum tersedia. Coba Bahasa Indonesia atau ulangi nanti."},{status:502,headers});}
}
