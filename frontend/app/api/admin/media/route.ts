import { adminActor, apiError, noStore } from "../../../../src/lib/adminApi";
import { saveCmsMedia } from "../../../../src/lib/cmsMedia";
import { articleBodyBytes } from "../../../../src/lib/articleApi";
export const runtime = "nodejs";
export async function POST(request:Request) { try { const actor=await adminActor(request); const bytes=await articleBodyBytes(request,process.env.VERCEL === "1" ? 4300000 : 30100000); const form=await new Response(bytes.buffer as ArrayBuffer,{headers:{"Content-Type":request.headers.get("content-type")||""}}).formData(); const owner=form.get("ownerDivision"); if(owner !== null && typeof owner !== "string") return Response.json({message:"Divisi tidak valid."},{status:400}); return Response.json(await saveCmsMedia(form.get("media"),actor,false,owner === null ? undefined : owner || null),{headers:noStore}); } catch(error) { return apiError(error); } }
