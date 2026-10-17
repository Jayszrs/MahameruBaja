// Client-supplied artwork, 17 October 2026 (1437 x 1095). Frames display the original sheet
// without redrawing logos or overwriting custom CMS uploads.
export const corporateLogoSheet = "/images/brand/client-corporate-trio.png";
const mbiFrame = {
  name: "mbi", viewBox: "458 520 525 530",
  clip: "polygon(600px 520px,830px 520px,983px 600px,983px 1050px,458px 1050px,458px 600px)",
};
export const corporateLogoFrames: Record<string, { name: string; viewBox: string; clip: string }> = {
  "/images/steel-indonesia/company-logo.jpeg": mbiFrame,
  "/images/brand/mbi-laser.png": mbiFrame,
  "/images/brand/mbi-trading.png": mbiFrame,
  "/images/brand/mbi-proyek.png": mbiFrame,
  "/images/brand/mahameru-retail.png": {
    name: "mmn", viewBox: "40 35 610 525",
    clip: "polygon(40px 35px,650px 35px,650px 470px,525px 470px,525px 560px,175px 560px,175px 470px,40px 470px)",
  },
  "/images/brand/garuda.png": {
    name: "gmb", viewBox: "695 35 690 530",
    clip: "polygon(695px 35px,1385px 35px,1385px 470px,1235px 470px,1235px 565px,915px 565px,915px 470px,695px 470px)",
  },
};
