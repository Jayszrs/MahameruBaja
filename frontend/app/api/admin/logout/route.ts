import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../src/lib/adminAuth";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) return new NextResponse("Forbidden", { status: 403 });
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.delete(ADMIN_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
