import "server-only";

/** Explicit opt-in namespace for isolated fixtures; existing installations keep their data. */
export function cmsBlobPrefix() {
  const prefix = process.env.CMS_BLOB_PREFIX || "mahameru-preview/v1/";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,150}\/$/.test(prefix) || prefix.includes("//") || prefix.includes("..")) throw new Error("STORAGE_NAMESPACE_INVALID");
  return prefix;
}
