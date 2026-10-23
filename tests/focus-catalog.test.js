import test from 'node:test';
import assert from 'node:assert/strict';
import { packs, focusPacks } from '../src/packs.js';
import { challenge, countries, practiceCountries } from '../src/logic.js';
test('50 unique practice activities, focus flag always appears first with valid distinct choices', () => {
 assert.ok(packs.length>=50);
 assert.equal(new Set(packs.map(p=>p.id)).size,packs.length);
 assert.equal(countries.length,40);
 assert.equal(practiceCountries.length,42);
 for (const p of focusPacks) for (const day of ['2026-10-23','2030-01-01']) {
  const questions=challenge(day,p.codes,p.focusCode);
  assert.equal(questions.length,5);
  assert.equal(questions[0].country[0],p.focusCode);
  assert.equal(new Set(questions.map(q=>q.country[0])).size,5);
  for (const q of questions) {
   assert.equal(new Set(q.options.map(c=>c[0])).size,4);
   assert.ok(q.options.some(c=>c[0]===q.country[0]));
  }
 }
 for (const q of challenge('2026-10-23')) assert.ok(countries.some(c=>c[0]===q.country[0]));
});
