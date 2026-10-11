import { NextResponse } from "next/server";
import { adminActor, apiError, jsonInput, noStore } from "../../../../src/lib/adminApi";
import { changePassword } from "../../../../src/lib/accountStore";
import { ADMIN_COOKIE, adminCookieOptions, createAdminSession } from "../../../../src/lib/adminAuth";
export async function POST(request: Request) { try { const actor = await adminActor(request,false,true); const saved = await changePassword(actor,await jsonInput(request,10000)); const response = NextResponse.json({message:"Password diperbarui. Sesi sebelumnya telah dicabut."},{headers:noStore}); response.cookies.set(ADMIN_COOKIE,await createAdminSession(saved.email),adminCookieOptions); return response; } catch(error) { return apiError(error); } }
