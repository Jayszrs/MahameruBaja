import Image, { type ImageProps } from "next/image";
export default function CmsImage(props: ImageProps) { return <Image {...props} unoptimized={props.unoptimized || typeof props.src === "string" && (props.src.startsWith("/api/") || props.src.startsWith("/media/") || props.src.startsWith("https://") && !props.src.includes(".public.blob.vercel-storage.com/"))} />; }
