# Aset poster desktop

Empat versi landscape dibuat dengan **built-in imagegen**, dari poster portrait yang sudah ada. Gambar keluaran diperiksa secara visual, lalu dioptimalkan menjadi WebP. Poster portrait asli tetap digunakan untuk HP.

| Target proyek | Referensi / edit target |
|---|---|
| `frontend/public/images/posters/jasa-laser-cutting-landscape.webp` | `frontend/public/images/posters/jasa-laser-cutting.jpeg` |
| `frontend/public/images/posters/ring-cakar-sloof-landscape.webp` | `frontend/public/images/posters/ring-cakar-sloof.jpeg` |
| `frontend/public/images/posters/selamat-pagi-landscape.webp` | `frontend/public/images/posters/selamat-pagi.jpeg` |
| `frontend/public/images/posters/promo-hollow-oktober-landscape.webp` | `frontend/public/images/posters/promo-hollow-oktober.jpeg` |

Prompt akhir menggunakan template berikut, dengan nilai masing-masing baris di bawah. Satu pemanggilan untuk satu gambar, latar tidak transparan.

```text
Use case: ads-marketing. Edit target: attached portrait Mahameru Baja poster.
Produce ONE finished, truly LANDSCAPE 16:9 advertisement image, horizontal
composition, for desktop popup. Rearrange the reference artwork into a wide
design, do NOT put the entire tall poster in a wide frame. Keep the original
red/black/white Mahameru brand, original geometric red-and-black logo accurate,
industrial photography and the subject/product identity from this poster.
Brand text EXACT: "MAHAMERU BAJA". Headline EXACT: "{headline}".
Supporting line EXACT: "{subtitle}". Small line EXACT: "{extra}".
Contact EXACT: "WhatsApp 0812 1805 2017". High legibility. Large horizontal
photographic product/laser cutting scene alongside typography, balanced clear
margins. No additional offers, discounts, certifications, addresses, hours,
promises, QR codes, or invented text. This is a resized marketing creative,
not new evidence of a completed project. Output a local file artifact so it
can be saved into the website project.
```

| Poster | Headline | Subtitle | Extra |
|---|---|---|---|
| Laser | JASA LASER CUTTING | Potong plat sesuai desain Anda | Laser cutting plat • Bending • Ornamen • Komponen custom |
| Ring | RING, CAKAR AYAM & SLOOF BESI | Material untuk kebutuhan bangunan | Pilihan ukuran standar dan custom |
| Toko | SELAMAT DATANG DI MAHAMERU BAJA | Material dan pengerjaan baja dalam satu tempat | Besi beton • Hollow • Pipa • Plat |
| Hollow | HOLLOW HITAM & GALVANIS | Pilihan material untuk kebutuhan Anda | Periode promo: 1–31 Oktober 2026 |

Periode promo hollow tetap berakhir 31 Oktober 2026. Perubahan orientasi tidak memperpanjang masa tayangnya.
