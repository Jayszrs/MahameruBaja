import "server-only";
import sharp from "sharp";
import { createFile, type Movie } from "mp4box";
import { CmsError } from "./cmsError";
import type { MediaKind } from "./mediaReferences";

export type UploadKind = MediaKind | "media";
export const imageByteLimit = 4_000_000;
export const videoByteLimit = () => process.env.VERCEL === "1" ? imageByteLimit : 30_000_000;
const badVideo = () => new CmsError("Ekspor ulang video sebagai MP4 H.264 standar yang lengkap, dengan audio AAC bila ada.");
type Box = { type: string; start: number; body: number; end: number };

function boxes(bytes: Buffer, start: number, end: number): Box[] {
  const result: Box[] = [];
  while (start < end) {
    if (end - start < 8 || result.length > 10000) throw badVideo();
    let size = bytes.readUInt32BE(start); let header = 8;
    if (size === 1) { if (end - start < 16) throw badVideo(); const long = bytes.readBigUInt64BE(start + 8); if (long > BigInt(Number.MAX_SAFE_INTEGER)) throw badVideo(); size = Number(long); header = 16; }
    if (size === 0) size = end - start;
    if (size < header || size > end - start) throw badVideo();
    result.push({ type: bytes.toString("latin1", start + 4, start + 8), start, body: start + header, end: start + size });
    start += size;
  }
  return result;
}

function validateVideo(bytes: Buffer) {
  try {
    const top = boxes(bytes, 0, bytes.length);
    if (top[0]?.type !== "ftyp" || top[0].end - top[0].body < 8 || top.filter(box => box.type === "moov").length !== 1) throw badVideo();
    const data = top.filter(box => box.type === "mdat" && box.end > box.body);
    if (!data.length) throw badVideo();
    // Check table bounds before MP4Box allocates sample lists from untrusted
    // count fields. The upload's byte limit also bounds metadata and payload.
    let boxCount = 0; let totalSamples = 0;
    function inspect(start: number, end: number, depth = 0) {
      if (depth > 20) throw badVideo();
      for (const box of boxes(bytes, start, end)) {
        if (++boxCount > 10000) throw badVideo();
        const remaining = box.end - box.body;
        // These variants can expand attacker-controlled sample counts before
        // post-parse checks. Standard self-contained MP4 uses stsz/stco tables.
        if (["stz2", "mvex", "moof", "trun", "tfhd"].includes(box.type)) throw badVideo();
        if (["moov", "trak", "mdia", "minf", "stbl", "edts", "dinf", "mvex", "moof", "traf"].includes(box.type)) inspect(box.body, box.end, depth + 1);
        if (box.type === "stsd") {
          if (remaining < 8) throw badVideo();
          const count = bytes.readUInt32BE(box.body + 4);
          if (count < 1 || count > 8 || boxes(bytes, box.body + 8, box.end).length !== count) throw badVideo();
        }
        if (box.type === "stsz") {
          if (remaining < 12) throw badVideo();
          const fixed = bytes.readUInt32BE(box.body + 4), count = bytes.readUInt32BE(box.body + 8);
          totalSamples += count;
          if (totalSamples > 250000 || (!fixed && count > Math.floor((remaining - 12) / 4))) throw badVideo();
        }
        const entries: Record<string, number> = { stts: 8, ctts: 8, stsc: 12, stco: 4, co64: 8, stss: 4 };
        if (entries[box.type] && (remaining < 8 || bytes.readUInt32BE(box.body + 4) > Math.floor((remaining - 8) / entries[box.type]))) throw badVideo();
        if (["senc", "pssh"].includes(box.type)) throw badVideo();
      }
    }
    inspect(0, bytes.length);
    const parser = createFile(); let info: Movie | undefined; let invalid = false;
    parser.onReady = movie => { info = movie; };
    parser.onError = () => { invalid = true; };
    const input = Uint8Array.from(bytes).buffer as Parameters<typeof parser.appendBuffer>[0]; input.fileStart = 0;
    parser.appendBuffer(input); parser.flush();
    if (invalid || !info || !info.videoTracks.length || info.tracks.length > 8 || !Number.isFinite(info.timescale) || !(info.timescale > 0) || !Number.isFinite(info.duration) || !(info.duration > 0)) throw badVideo();
    for (const track of info.tracks) {
      const video = Boolean(track.video);
      if (!Number.isFinite(track.timescale) || !(track.timescale > 0) || !Number.isFinite(track.duration) || !(track.duration > 0)) throw badVideo();
      if (video ? !/^avc[13]\./.test(track.codec) : !track.audio || !/^mp4a\.40\.(?:2|5|29)$/.test(track.codec)) throw badVideo();
      if (track.video && (!(track.video.width > 0) || !(track.video.height > 0) || track.video.width * track.video.height > 40_000_000)) throw badVideo();
      type Sample = { offset: number; size: number; duration: number; description?: { avcC?: { lengthSizeMinusOne: number; SPS?: unknown[]; PPS?: unknown[] } } };
      const samples = parser.getTrackById(track.id)?.samples as Sample[] | undefined;
      if (!samples?.length || samples.length > 250000 || samples.length !== track.nb_samples) throw badVideo();
      for (const sample of samples) {
        if (!Number.isSafeInteger(sample.offset) || !Number.isSafeInteger(sample.size) || sample.size < 1 || !Number.isFinite(sample.duration) || sample.duration < 0 || !data.some(box => sample.offset >= box.body && sample.offset + sample.size <= box.end)) throw badVideo();
        if (!video) continue;
        const config = sample.description?.avcC;
        if (!config || !config.SPS?.length || !config.PPS?.length || ![0, 1, 3].includes(config.lengthSizeMinusOne)) throw badVideo();
        const lengthBytes = config.lengthSizeMinusOne + 1, end = sample.offset + sample.size;
        let offset = sample.offset;
        while (offset < end) {
          if (offset + lengthBytes > end) throw badVideo();
          const length = bytes.readUIntBE(offset, lengthBytes); offset += lengthBytes;
          if (!length || offset + length > end || (bytes[offset] & 0x80) || (bytes[offset] & 0x1f) === 0) throw badVideo();
          offset += length;
        }
      }
    }
  } catch { throw badVideo(); }
}

export async function normalizeUpload(file: FormDataEntryValue | null, kind: UploadKind) {
  const limit = kind === "image" ? imageByteLimit : videoByteLimit();
  if (!(file instanceof File) || !file.size) throw new CmsError("Pilih berkas yang tidak kosong.");
  if (file.size > limit) throw new CmsError(`Ukuran berkas maksimal ${limit / 1_000_000} MB.`, 413);
  let bytes = Buffer.from(await file.arrayBuffer());
  const ext = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? "jpg" : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png" : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : bytes.toString("ascii", 4, 8) === "ftyp" ? "mp4" : null;
  if (!ext) throw new CmsError("Gunakan JPG, PNG, WebP, atau video MP4 H.264.");
  const type: MediaKind = ext === "mp4" ? "video" : "image";
  if (kind !== "media" && kind !== type) throw new CmsError(kind === "image" ? "Kolom ini hanya menerima JPG, PNG, atau WebP." : "Kolom ini hanya menerima video MP4 H.264.");
  const mime = ext === "mp4" ? "video/mp4" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  if (file.type !== mime) throw new CmsError("Jenis berkas tidak sesuai dengan isinya.");
  if (type === "video") validateVideo(bytes);
  else {
    if (bytes.length > imageByteLimit) throw new CmsError("Gambar maksimal 4 MB.", 413);
    try {
      const image = sharp(bytes, { failOn: "warning", limitInputPixels: 40_000_000 });
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height || (metadata.pages || 1) > 1) throw new Error("INVALID_IMAGE");
      // Re-encoding strips EXIF/GPS and trailing payloads. rotate() applies EXIF
      // orientation before stripping metadata; PNG/WebP retain transparency.
      bytes = await image.rotate().toFormat(ext === "jpg" ? "jpeg" : ext === "png" ? "png" : "webp").toBuffer();
      if (bytes.length > imageByteLimit) throw new CmsError("Gambar setelah diproses melebihi 4 MB.", 413);
    } catch (error) { if (error instanceof CmsError) throw error; throw new CmsError("Isi gambar rusak, animasi tidak didukung, atau resolusi melebihi 40 megapiksel."); }
  }
  return { bytes, ext, mime, type };
}
