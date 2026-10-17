import { googleRating,googleReviewCount,googleReviewsCapturedAt,googleReviews } from "./googleReviews";
import { defaultGarudaReviews } from "./divisionLocations";
import type { ReviewContent } from "./siteContent";

export const savedReviewSnapshots:Record<string,ReviewContent>={
  main:{rating:googleRating,reviewCount:googleReviewCount,ratingDate:googleReviewsCapturedAt,mapsUrl:"https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8",reviews:googleReviews},
  garuda:defaultGarudaReviews,
};
savedReviewSnapshots["retail-tambun"]=savedReviewSnapshots.main;
const key=(value:string)=>value.replace(/\s+/g," ").trim().toLowerCase();
export function missingSnapshotReviews(current:ReviewContent,snapshot:ReviewContent) {
  const ids=new Set(current.reviews.map(row=>row.id));
  const fingerprints=new Set(current.reviews.map(row=>`${key(row.author)}\0${key(row.text)}`));
  return snapshot.reviews.filter(row=>!ids.has(row.id)&&!fingerprints.has(`${key(row.author)}\0${key(row.text)}`));
}
export function restoreSnapshotReviews(current:ReviewContent,snapshot:ReviewContent,summary=false) {
  return {...current,...(summary?{rating:snapshot.rating,reviewCount:snapshot.reviewCount,ratingDate:snapshot.ratingDate,mapsUrl:snapshot.mapsUrl}:{}),reviews:[...current.reviews,...missingSnapshotReviews(current,snapshot)]};
}
