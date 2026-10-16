import { adminActor, apiError } from "../../../../../../../src/lib/adminApi";
import { readRequests } from "../../../../../../../src/lib/requestStore";
import { requestPhotoResponse } from "../../../../../../../src/lib/requestPhotos";
import { missingMedia } from "../../../../../../../src/lib/mediaResponse";

export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ id: string; filename: string }> }) {
  try {
    const actor = await adminActor();
    const { id, filename } = await context.params;
    if (!/^MBI-\d{8}-[A-F0-9]{8}$/.test(id) || !/^[a-f0-9-]{36}\.webp$/.test(filename)) return missingMedia();
    const record = (await readRequests()).find(record => record.id === id && (!actor.division || record.businessUnitSlug === actor.division));
    const photo = record?.photos.find(photo => photo.filename === filename);
    return photo ? await requestPhotoResponse(request, photo) : missingMedia();
  } catch (error) { return apiError(error); }
}
