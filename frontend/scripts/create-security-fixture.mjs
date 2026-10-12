import assert from "node:assert/strict";
import { scryptSync, randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";

assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Only create disposable fixture configuration.");
const destination = process.argv[2];
assert(destination?.startsWith("/artifacts/"));
const hash = password => { const salt = randomBytes(16).toString("hex"); return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`; };
await writeFile(destination, [
  "ADMIN_EMAIL=cms-test@example.test",
  `ADMIN_PASSWORD_HASH=${hash("article-test-local")}`,
  `ADMIN_SESSION_SECRET=${randomBytes(48).toString("base64url")}`,
  `ADMIN_ACCOUNTS_JSON=${JSON.stringify([
    { email: "division-a@example.test", passwordHash: hash("division-fixture-a"), division: "retail-tambun" },
    { email: "division-b@example.test", passwordHash: hash("division-fixture-b"), division: "retail-cibitung" },
  ])}`,
  "CMS_DATA_DIR=/app/cms-data",
  "SITE_PREVIEW_MODE=0",
].join("\n") + "\n", { mode: 0o600 });
console.log("Disposable test environment created; values not logged.");
