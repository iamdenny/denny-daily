import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  analyticsChoice,
  quizPayload,
  safePage,
  validMeasurement,
} from "../src/analytics.js";
test("analytics never carries query or hash inputs; consent expires", () => {
  assert.equal(
    safePage("https://example.com/ko/?email=private#words=secret"),
    "https://example.com/ko/",
  );
  const now = Date.now();
  assert.equal(
    analyticsChoice(JSON.stringify({ choice: "granted", at: now }), now),
    "granted",
  );
  for (const raw of [
    "null",
    "bad",
    JSON.stringify({ choice: "granted", at: now + 1 }),
    JSON.stringify({ choice: "granted", at: now - 181 * 86400000 }),
  ])
    assert.equal(analyticsChoice(raw, now), null);
  assert(validMeasurement("G-ABC1234567"));
  assert(!validMeasurement("G-<script>"));
});
test("every message has all locales and consistent interpolation fields", async () => {
  const messages = JSON.parse(await readFile("src/messages.json", "utf8"));
  for (const [key, values] of Object.entries(messages))
    for (const lang of ["en", "ko", "ja", "es"]) {
      assert(values[lang], `${key}: ${lang}`);
      assert.deepEqual(
        [...values[lang].matchAll(/\{\w+\}/g)].map((x) => x[0]).sort(),
        [...key.matchAll(/\{\w+\}/g)].map((x) => x[0]).sort(),
        key,
      );
    }
});
import { packs } from "../src/packs.js";
import { challenge } from "../src/logic.js";
test("practice packs draw five unique answers and only use their region", () => {
  for (const pack of packs)
    for (let n = 0; n < 20; n++) {
      const questions = challenge("practice:" + n, pack.codes);
      assert.equal(new Set(questions.map((q) => q.country[0])).size, 5);
      for (const q of questions) {
        assert.equal(new Set(q.options.map((c) => c[0])).size, 4);
        assert(q.options.some((c) => c[0] === q.country[0]));
        if (pack.codes)
          for (const c of q.options) assert(pack.codes.includes(c[0]));
      }
    }
});

test("quiz milestones require consent and omit answer and share-link data", () => {
  const url = "https://daily.iamdenny.com/ko/?email=private#answers=secret";
  for (const choice of [null, "denied"]) assert.equal(quizPayload("start_quiz", choice, true, url, "ko"), null);
  assert.equal(quizPayload("finish_quiz", "granted", false, url, "ko"), null);
  assert.equal(quizPayload("private_answer", "granted", true, url, "ko"), null);
  for (const event of ["start_quiz", "finish_quiz"]) assert.deepEqual(quizPayload(event, "granted", true, url, "ko"), {
    event, params: { tool: "daily", page_location: "https://daily.iamdenny.com/ko/", language: "ko" }
  });
});
