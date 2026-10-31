import { notFound } from "next/navigation";
import CmsPageGuide from "../../../../../src/components/CmsPageGuide";
import { cmsPages } from "../../../../../src/data/cmsPageMap";
export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!Object.hasOwn(cmsPages, page)) notFound();
  return <CmsPageGuide pageKey={page} />;
}
