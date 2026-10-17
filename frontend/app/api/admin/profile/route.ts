import { z } from "zod";
import { adminAuthentication, apiError, jsonInput, noStore } from "../../../../src/lib/adminApi";
import { readAccounts, saveOwnAvatar } from "../../../../src/lib/accountStore";
import { publicAccount, accountAvatarSchema } from "../../../../src/data/adminAccount";
import { CmsError } from "../../../../src/lib/cmsError";
export async function GET(request: Request) {
  try {
    const { identity } = await adminAuthentication(request);
    const account = (await readAccounts()).find(row => row.id === identity.id);
    if (!account) throw new CmsError("Akun tidak ditemukan.", 404);
    return Response.json(publicAccount(account), { headers: noStore });
  } catch (error) { return apiError(error); }
}
export async function PUT(request: Request) {
  try {
    const { identity, sessionVersion } = await adminAuthentication(request);
    const input = z.object({ avatar: accountAvatarSchema, revision: z.number().int().nonnegative() }).strict().parse(await jsonInput(request));
    return Response.json(await saveOwnAvatar(identity, input.avatar, input.revision, sessionVersion), { headers: noStore });
  } catch (error) { return apiError(error); }
}
