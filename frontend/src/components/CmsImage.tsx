import Image, { getImageProps, type ImageProps } from "next/image";
import { useId } from "react";
import { isPublicBlobUrl } from "../data/safeUrls";
import { corporateLogoFrames, corporateLogoSheet } from "../data/corporateLogos";
const logoSheetProps = getImageProps({ src: corporateLogoSheet, alt: "", width: 1437, height: 1095 }).props;
const logoSheetSrc = logoSheetProps.srcSet?.split(",")[0].trim().split(/\s+/)[0] || logoSheetProps.src;
export default function CmsImage({ transparentLogo = false, ...props }: ImageProps & { transparentLogo?: boolean }) {
  const filterId = `logo-paper-${useId().replace(/:/g, "")}`;
  const logo = typeof props.src === "string" ? corporateLogoFrames[props.src] : undefined;
  if (logo) return <svg xmlns="http://www.w3.org/2000/svg" viewBox={logo.viewBox} preserveAspectRatio="xMidYMid meet"
    width={props.fill ? undefined : props.width} height={props.fill ? undefined : props.height}
    className={`corporate-logo ${props.className || ""}`} role={props.alt ? "img" : undefined} aria-label={props.alt || undefined} aria-hidden={props.alt ? undefined : true}
    data-corporate-logo={logo.name} data-logo-source={String(props.src)} focusable="false"
    style={{ ...(props.fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } as const : {}), ...props.style, ...(transparentLogo ? { background:"transparent", borderRadius:0, boxShadow:"none" } : {}), overflow: "hidden" }}>
    {transparentLogo && <defs><filter id={filterId} colorInterpolationFilters="sRGB">
      {/* Remove near-white paper, retaining the original dark and colored artwork. */}
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -6 -6 -6 0 17" />
    </filter></defs>}
    <image href={logoSheetSrc} x="0" y="0" width="1437" height="1095" style={{ clipPath: logo.clip }} filter={transparentLogo ? `url(#${filterId})` : undefined} />
    {logo.wordmark&&<text className="corporate-logo-wordmark" x="345" y="538" textAnchor="middle" textLength="570" lengthAdjust="spacingAndGlyphs" fill="#d00000" fontSize="68" fontWeight="900" fontFamily="var(--font-archivo), Arial, sans-serif">{logo.wordmark}</text>}
  </svg>;
  const privateOrExternal = typeof props.src === "string" && (props.src.startsWith("/") && !props.src.startsWith("/images/") && props.src !== "/mbi-mark.svg" || props.src.startsWith("https://") && !isPublicBlobUrl(props.src));
  if (transparentLogo) return <>
    <svg aria-hidden="true" focusable="false" style={{position:"absolute",width:0,height:0,overflow:"hidden"}}>
      <defs><filter id={filterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -6 -6 -6 0 17" result="paperless"/><feComposite in="paperless" in2="SourceGraphic" operator="in"/></filter></defs>
    </svg>
    <Image {...props} unoptimized={props.unoptimized || privateOrExternal} style={{...props.style,filter:[props.style?.filter,`url(#${filterId})`].filter(Boolean).join(" "),background:"transparent"}}/>
  </>;
  return <Image {...props} unoptimized={props.unoptimized || privateOrExternal} />;
}
