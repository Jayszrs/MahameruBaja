"""Extract only supplied supplier logos and project photos; never legal pages.

Usage: python frontend/scripts/extract-compro-assets.py <company-profile.pdf>
The PDF contains flattened page images (1056 x 1493). Rectangles below retain
the original photography without generating details or enlarging the pixels.
"""
from pathlib import Path
from io import BytesIO
import sys
import fitz
from PIL import Image, ImageOps, ImageDraw

destination = Path(__file__).resolve().parents[1] / "public/images/compro"
destination.mkdir(parents=True, exist_ok=True)
document = fitz.open(sys.argv[1])
photos = {
    7: ("rumah-villa", [(78,493,521,714),(534,493,977,714),(78,728,374,1189),(386,728,977,949),(386,962,613,1184),(626,962,977,1184),(79,1197,523,1418),(536,1197,977,1418)]),
    8: ("welding-robot", [(78,493,365,892),(383,493,671,892),(690,493,977,892),(78,907,519,1145),(534,907,977,1145),(78,1161,977,1418)]),
    9: ("tower-monopol", [(78,493,365,891),(383,493,671,891),(690,493,977,891),(78,907,519,1145),(534,907,977,1145),(78,1161,661,1418),(676,1161,977,1418)]),
    10: ("gedung-arsip", [(78,493,608,891),(623,493,977,891),(78,907,519,1145),(534,907,977,1145),(78,1161,661,1418),(676,1161,977,1418)]),
    11: ("painting", [(78,493,608,891),(623,493,977,891),(78,907,519,1145),(534,907,977,1145),(78,1161,661,1418),(676,1161,977,1418)]),
    12: ("floor-coating", [(77,495,334,888),(347,495,608,742),(347,756,608,888),(624,495,978,891),(77,909,513,1145),(528,909,978,1023),(528,1034,978,1148),(80,1163,663,1417),(678,1163,978,1417)]),
    13: ("perkuatan-gedung", [(79,493,401,891),(430,493,604,891),(615,493,790,891),(802,493,977,891),(79,909,520,1145),(534,909,746,1145),(757,909,977,1418),(79,1161,625,1418),(639,1161,746,1418)]),
    14: ("lantai-mezanin", [(79,493,400,891),(418,493,598,891),(615,494,977,888),(79,907,520,1144),(532,907,746,1144),(758,908,977,1144),(79,1161,462,1417),(474,1161,746,1417),(758,1161,977,1417)]),
    15: ("railing-stainless", [(78,493,365,891),(383,493,671,891),(690,493,977,891),(78,907,519,1145),(534,907,977,1145),(78,1161,661,1418),(676,1161,977,1418)]),
    16: ("jembatan-ajibata", [(79,493,400,891),(411,493,689,643),(698,494,978,643),(411,654,625,891),(863,654,977,891),(79,908,520,1145),(532,908,746,1145),(758,908,977,1145),(79,1161,462,1417),(474,1161,977,1417)]),
    17: ("jembatan-tanjung-lesung", [(79,495,400,891),(411,495,689,643),(698,495,978,643),(411,654,625,891),(635,654,977,891),(79,908,520,1145),(532,908,977,1145),(79,1161,462,1417),(474,1161,977,1417)]),
}
suppliers = [
    ("krakatau-steel-center", (90,457,288,560)), ("hsc", (325,459,480,548)),
    ("grp", (536,459,725,549)), ("gunawan-dianjaya", (773,453,972,565)),
    ("supplier-logo-pdf", (142,598,293,749)), ("wahana-sentra", (420,612,621,711)),
    ("cita-baja", (749,590,973,714)), ("master-steel", (92,776,321,936)),
    ("lautan-steel", (333,788,596,935)), ("perwira-steel", (618,793,765,935)),
    ("sentral-pipa", (798,759,1012,971)), ("inter-world", (102,971,258,1141)),
    ("kwosm", (321,988,604,1155)), ("krakatau-pipe", (650,1014,1011,1124)),
    ("kpss", (151,1196,288,1354)), ("intisumber-bajasakti", (399,1181,652,1330)),
    ("spindo", (725,1204,1015,1316)),
]
previews = []
for number, (slug, rectangles) in photos.items():
    page = document[number - 1]
    original = Image.open(BytesIO(document.extract_image(page.get_images()[0][0])["image"])).convert("RGB")
    for i, rect in enumerate(rectangles, 1):
        cropped = original.crop(rect)
        cropped.save(destination / f"{slug}-{i:02}.webp", "WEBP", quality=90, method=6)
        previews.append((f"p{number} {slug} {i}", cropped))
for slug, rect in suppliers:
    page = document[17]
    original = Image.open(BytesIO(document.extract_image(page.get_images()[0][0])["image"])).convert("RGB")
    cropped = original.crop(rect)
    cropped.save(destination / f"supplier-{slug}.webp", "WEBP", lossless=True, method=6)
    previews.append((slug, cropped))
# Verification sheet only, not a public asset.
scratch = Path("tmp/pdfs/mbi-compro")
scratch.mkdir(parents=True, exist_ok=True)
sheet = Image.new("RGB", (1200, ((len(previews) + 5) // 6) * 165), "#eee")
draw = ImageDraw.Draw(sheet)
for i, (label, cropped) in enumerate(previews):
    x, y = (i % 6) * 200, (i // 6) * 165
    sheet.paste(ImageOps.contain(cropped, (190, 135)), (x + 5, y + 22))
    draw.text((x + 5, y + 5), label, fill="black")
sheet.save(scratch / "extracted-assets.png")
print(f"Extracted {sum(len(rects) for _, rects in photos.values())} project photos in {len(photos)} albums and {len(suppliers)} supplier logos.")
