import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(scriptDirectory, "..");
const defaultSnapshot = path.join(frontendDirectory, "data", "google-maps-snapshot.html");
const htmlPath = path.resolve(process.argv[2] ?? defaultSnapshot);
const html = await readFile(htmlPath, "utf8");
const reviewStart = /<div class="jftiEf fontBodyMedium\s*" aria-label="([^"]*)" data-review-id="([^"]+)"/g;
const starts = [...html.matchAll(reviewStart)];
const mapsUrl = "https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8";
const assetDirectory = `${htmlPath.slice(0, -path.extname(htmlPath).length)}_files`;
const outputDirectory = path.join(frontendDirectory, "public", "images", "google-reviews");
const reviews = [];
const ratingMatch = html.match(/<div class="fontDisplayLarge">([\d.]+)<\/div>/);
const countMatch = html.match(/<div class="fontBodySmall"[^>]*>(\d+) reviews<\/div>/);

if (!ratingMatch || !countMatch) {
  throw new Error("Maps snapshot is missing its overall rating or review count.");
}
const overallRating = Number(ratingMatch[1]);
const overallReviewCount = Number(countMatch[1]);

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function plainText(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

await mkdir(outputDirectory, { recursive: true });

for (let index = 0; index < starts.length; index++) {
  const start = starts[index];
  const end = starts[index + 1]?.index ?? html.length;
  const block = html.slice(start.index, end);
  const rating = Number(block.match(/aria-label="([1-5]) stars"/)?.[1] ?? 0);
  const textMatch = block.match(/<span class="wiI7pd"[^>]*>([\s\S]*?)<\/span>/);
  const text = textMatch ? plainText(textMatch[1]) : "";

  if (rating <= 4 || !text) continue;

  const reviewId = start[2];
  const id = `google-${createHash("sha256").update(reviewId).digest("hex").slice(0, 20)}`;
  const dateMatch = block.match(/<span class="rsqaWe"[^>]*>([\s\S]*?)<\/span>/);
  const authorHref = block.match(/<button[^>]*data-href="([^"]+)"[^>]*aria-label="Photo of/);
  const photoMatch = block.match(/<img class="NBa7we"[^>]*src="([^"]+)"/);
  let authorPhoto;

  if (photoMatch) {
    const relativeSource = decodeHtml(photoMatch[1]).replace(/^\.\//, "");
    const sourcePhoto = path.resolve(path.dirname(htmlPath), relativeSource);
    const relativeToAssets = path.relative(assetDirectory, sourcePhoto);
    if (relativeToAssets !== ".." && !relativeToAssets.startsWith(`..${path.sep}`)) {
      const extension = path.extname(sourcePhoto).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
        const destination = path.join(outputDirectory, `${id}${extension}`);
        try {
          await copyFile(sourcePhoto, destination);
          authorPhoto = `/images/google-reviews/${id}${extension}`;
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      }
    }
  }

  const authorUrl = authorHref ? decodeHtml(authorHref[1]) : undefined;
  reviews.push({
    id,
    author: decodeHtml(start[1]),
    rating,
    text: text.slice(0, 2000),
    when: dateMatch ? plainText(dateMatch[1]) : "",
    url: mapsUrl,
    ...(authorPhoto ? { authorPhoto } : {}),
    ...(authorUrl ? { authorUrl } : {}),
    published: true,
  });
}

if (reviews.length === 0) {
  throw new Error("No Google Maps reviews above 4 stars with comments were found; existing data was not changed.");
}

const dataPath = path.join(frontendDirectory, "src", "data", "googleReviews.ts");
let previousData = "";
try {
  previousData = await readFile(dataPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const capturedAt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());
const output = `import type { SiteContent } from "./siteContent";\n\nexport const googleReviewsCapturedAt = ${JSON.stringify(capturedAt)};\nexport const googleRating = ${overallRating};\nexport const googleReviewCount = ${overallReviewCount};\nexport const googleReviews: SiteContent["reviews"] = ${JSON.stringify(reviews, null, 2)};\n`;
await writeFile(dataPath, output, "utf8");
const currentPhotos = new Set(reviews.map(review => review.authorPhoto).filter(Boolean).map(photo => path.basename(photo)));
for (const previousPhoto of previousData.matchAll(/\/images\/google-reviews\/(google-[a-f0-9]{20}\.(?:png|jpe?g|webp))/g)) {
  if (!currentPhotos.has(previousPhoto[1])) await unlink(path.join(outputDirectory, previousPhoto[1])).catch(error => {
    if (error.code !== "ENOENT") throw error;
  });
}
for (const filename of await readdir(outputDirectory)) {
  if (/^google-[a-f0-9]{20}\.(?:png|jpe?g|webp)$/.test(filename) && !currentPhotos.has(filename)) {
    await unlink(path.join(outputDirectory, filename));
  }
}
console.log(`Imported ${reviews.length} reviews rated above 4; Maps rating ${overallRating}/5 from ${overallReviewCount} reviews (${capturedAt}).`);
