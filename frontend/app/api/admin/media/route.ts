import { uploadCmsRequest } from "../../../../src/lib/cmsUploadApi";
export const runtime = "nodejs";
export async function POST(request: Request) { return uploadCmsRequest(request); }
