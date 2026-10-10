import { garudaGoogleReviews } from "./garudaGoogleReviews";

/** User-provided Google Maps HTML, saved 10 October 2026. Not a live API rating. */
export const garudaLocation = {
  name: "Garuda Marginal Baja",
  address: "Jl. Kp. Rw. Lele, RT.02/RW.05, Wanajaya, Kec. Cibitung, Kabupaten Bekasi, Jawa Barat 17520",
  mapsUrl: "https://maps.app.goo.gl/QR3pr7p55DKFeHMG9",
  latitude: -6.2456553,
  longitude: 107.1194034,
  embedUrl: "https://www.google.com/maps?q=Toko+Besi+Garuda+Marginal+Baja+Cibitung+Bekasi+Jawa+barat&ll=-6.2456553,107.1194034&z=17&output=embed",
};
export const defaultGarudaReviews = {
  rating: 5, reviewCount: 43, ratingDate: "10 Oktober 2026", mapsUrl: garudaLocation.mapsUrl, reviews: garudaGoogleReviews,
};
