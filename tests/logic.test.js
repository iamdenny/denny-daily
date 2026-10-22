import { test } from "node:test";
import assert from "node:assert/strict";
import { challenge, stats, validAnswers, utcDay } from "../src/logic.js";
test("daily challenge is deterministic, unique, with one correct choice", () => {
  for (let d = 1; d <= 28; d++) {
    const day = `2026-10-${String(d).padStart(2, "0")}`,
      q = challenge(day);
    assert.deepEqual(q, challenge(day));
    assert.equal(new Set(q.map((x) => x.country[0])).size, 5);
    q.forEach((x) => {
      assert.equal(new Set(x.options.map((o) => o[0])).size, 4);
      assert.equal(x.options.filter((o) => o[0] === x.country[0]).length, 1);
    });
  }
  assert.notDeepEqual(challenge("2026-10-01"), challenge("2026-10-02"));
});
test("streak allows today incomplete but stops at a missed day", () => {
  assert.deepEqual(stats({ "2026-10-20": 3, "2026-10-21": 5 }, "2026-10-22"), {
    streak: 2,
    played: 2,
    best: 5,
  });
  assert.equal(stats({ "2026-10-19": 4 }, "2026-10-22").streak, 0);
  assert.equal(
    stats({ "2026-10-22": 0, "2026-10-21": 1 }, "2026-10-22").streak,
    2,
  );
});
test("UTC boundary and malformed saved answers", () => {
  assert.equal(utcDay(new Date("2026-10-22T00:30:00+09:00")), "2026-10-21");
  assert.deepEqual(validAnswers(["XX"], challenge("2026-10-22")), []);
  assert.deepEqual(validAnswers({}, challenge("2026-10-22")), []);
});
