import assert from "node:assert/strict";
import test from "node:test";
import { tool } from "../scripts/views.mjs";

test("daily challenge shell announces progress and reserves its initial layout", () => {
  const html = tool("daily", (message) => message);

  assert.match(
    html,
    /class="progress" role="progressbar"[^>]*aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"/,
  );
  assert.match(html, /id="question" class="eyebrow">Question \{n\} of 5/);
  assert.match(html, /id="answers" class="answers" aria-busy="true"/);
  assert.equal((html.match(/class="answer-skeleton"/g) || []).length, 4);
});
