import Image from "./CmsImage";
import type { AppearanceItem } from "../data/websiteAppearance";
export default function MembershipMarks({ items }: { items: AppearanceItem[] }) {
  if (!items.length) return null;
  return <div className="membership-marks" aria-label="Keanggotaan asosiasi">{items.map(item => <div key={item.id} title={item.text || item.title}>{item.image && <Image src={item.image} alt={item.alt || item.text || item.title} width={100} height={52} sizes="75px" />}<span>{item.title}</span></div>)}</div>;
}
