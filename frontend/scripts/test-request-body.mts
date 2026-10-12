import assert from "node:assert/strict";
import { readBodyBytes, readJsonBody, readFormBody } from "../src/lib/requestBody";
import { CmsError } from "../src/lib/cmsError";

let checks = 0;
async function rejects(action: () => Promise<unknown>, status: number) {
  await assert.rejects(action, error => error instanceof CmsError && error.status === status);
  checks++;
}
const request = (body: string, type = "application/json") => new Request("http://localhost/test", { method: "POST", headers: { "Content-Type": type }, body });
assert.deepEqual(await readJsonBody(request('{"ok":true}'), 100), { ok: true }); checks++;
await rejects(() => readJsonBody(request("{"), 100), 400);
await rejects(() => readJsonBody(request("{}", "text/plain"), 100), 400);
await rejects(() => readBodyBytes(request("ééé"), 5), 413);
await rejects(() => readBodyBytes(new Request("http://localhost/test", { method: "POST", headers: { "Content-Length": "-1" }, body: "x" }), 100), 400);
await rejects(() => readBodyBytes(new Request("http://localhost/test", { method: "POST", headers: { "Content-Length": "101" }, body: "x" }), 100), 413);
let cancelled = false;
const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(4)); }, cancel() { cancelled = true; } });
await rejects(() => readBodyBytes(new Request("http://localhost/test", { method: "POST", body: stream, duplex: "half" } as RequestInit), 7), 413);
assert(cancelled, "Oversized streaming request is cancelled before full allocation"); checks++;
await rejects(() => readJsonBody(new Request("http://localhost/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: new Uint8Array([0xff]) }), 100), 400);
const form = await readFormBody(request("email=test%40example.test", "application/x-www-form-urlencoded"), 100);
assert.equal(form.get("email"), "test@example.test"); checks++;
await rejects(() => readFormBody(request("broken", "multipart/form-data; boundary=abc"), 100), 400);
await rejects(() => readFormBody(request("{}", "application/json"), 100), 400);
console.log(`Bounded request body: ${checks} checks passed.`);
