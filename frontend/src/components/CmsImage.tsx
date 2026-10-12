import Image, { type ImageProps } from "next/image";
import { isPublicBlobUrl } from "../data/safeUrls";
export default function CmsImage(props: ImageProps) {
  const privateOrExternal = typeof props.src === "string" && (props.src.startsWith("/") && !props.src.startsWith("/images/") && props.src !== "/mbi-mark.svg" || props.src.startsWith("https://") && !isPublicBlobUrl(props.src));
  return <Image {...props} unoptimized={props.unoptimized || privateOrExternal} />;
}
