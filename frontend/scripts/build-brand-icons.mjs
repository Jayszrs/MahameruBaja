import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Package the existing website logo at browser icon sizes without redrawing it.
const source = fileURLToPath(new URL("../public/images/brand/client-corporate-trio.png", import.meta.url));
const output = name => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
// Match the MBI frame used by CmsImage, excluding the two other company marks.
const mask = Buffer.from('<svg width="525" height="530"><polygon points="142,0 372,0 525,80 525,530 0,530 0,80" fill="white"/></svg>');
const artwork = await sharp(source).extract({ left: 458, top: 520, width: 525, height: 530 }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
const raster = size => sharp(artwork).flatten({ background: "#ffffff" }).resize(size, size, { fit: "contain", background: "#ffffff" }).ensureAlpha().png({ compressionLevel: 9 }).toBuffer();
await writeFile(output("favicon.png"), await raster(96));
await writeFile(output("apple-touch-icon.png"), await raster(180));
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(raster));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (let index = 0; index < sizes.length; index++) {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index]; directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4); directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(images[index].length, entry + 8); directory.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
}
await writeFile(output("favicon.ico"), Buffer.concat([directory, ...images]));
console.log("Packaged original MBI logo: favicon.ico, favicon.png (96px), apple-touch-icon.png (180px)");
