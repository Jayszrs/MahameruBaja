export const googleMapsUrl = "https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8";

export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  when?: string;
  url?: string;
  authorPhoto?: string;
  authorUrl?: string;
};

// Rating dibaca dari profil publik Google Maps pada 4 Oktober 2026.
// Kutipan ulasan perlu diisi persis sesuai sumber; tampilan publik meminta login untuk membacanya.
// Tidak ada permintaan API atau sinkronisasi otomatis.
export const googleRating: number | null = 4.5;
export const googleRatingObservedAt = "4 Oktober 2026";
export const googleReviewCount: number | null = null;
export const googleReviews: GoogleReview[] = [];
