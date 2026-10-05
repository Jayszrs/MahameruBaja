import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../src/lib/adminAuth";
import { adminRequestOrigin } from "../../../../src/lib/adminRequestOrigin";

export async function POST(request: NextRequest) {
  const origin = adminRequestOrigin(request);
  if (!origin) return new NextResponse("Forbidden", { status: 403 });
  const response = NextResponse.redirect(new URL("/admin/login", origin), 303);
  response.cookies.delete(ADMIN_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
