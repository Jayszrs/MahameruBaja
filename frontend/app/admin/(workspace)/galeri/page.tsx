import GalleryEditor from "../../../../src/components/GalleryEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Galeri Proyek | CMS" };
export default async function Page() { return <GalleryEditor initialContent={await readAdminContent()} />; }
