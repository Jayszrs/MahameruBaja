import { NextResponse } from "next/server";
import { adminAuthentication, apiError, jsonInput, noStore } from "../../../../src/lib/adminApi";
import { changePassword } from "../../../../src/lib/accountStore";
import { ADMIN_COOKIE, adminCookieOptions, createAdminSession } from "../../../../src/lib/adminAuth";
import { consumePasswordLimit, securityEvent, SecurityRateError } from "../../../../src/lib/securityState";
export async function POST(request: Request) {
  let accountId: string | undefined;
  try {
    const { identity: actor, sessionVersion } = await adminAuthentication(request, false, true);
    accountId = actor.id;
    await consumePasswordLimit(actor.id);
    const saved = await changePassword(actor, await jsonInput(request, 10000), sessionVersion);
    const response = NextResponse.json({ message: "Password diperbarui. Sesi sebelumnya telah dicabut." }, { headers: noStore });
    response.cookies.set(ADMIN_COOKIE, await createAdminSession(saved), adminCookieOptions);
    securityEvent("password_changed", actor.id);
    return response;
  } catch (error) {
    if (accountId) securityEvent(error instanceof SecurityRateError ? "password_limited" : "password_failed", accountId);
    return apiError(error);
  }
}
