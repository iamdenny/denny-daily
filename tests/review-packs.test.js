import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewPacks } from '../src/review-packs.js';
import { practiceCountries, challenge } from '../src/logic.js';
import { readFileSync } from 'node:fs';
test('100 distinct review decks cover every practice country and test every listed flag',()=>{
 const messages=JSON.parse(readFileSync(new URL('../src/messages.json',import.meta.url)));
 assert.equal(reviewPacks.length,100);
 assert.equal(new Set(reviewPacks.map(p=>[...p.codes].sort().join(','))).size,100);
 const covered=new Set(reviewPacks.flatMap(p=>p.codes));
 for(const [code] of practiceCountries)assert.ok(covered.has(code),code);
 for(const p of reviewPacks){
  assert.equal(new Set(p.codes).size,5);
  for(const lang of ['en','ko','ja','es'])assert.ok(messages[p.name][lang]);
  for(const seed of ['2026-10-24','2027-04-03']){
   const questions=challenge(seed,p.codes);
   assert.deepEqual(questions.map(q=>q.country[0]).sort(),[...p.codes].sort());
   for(const q of questions){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(c=>c[0])).size,4);assert.equal(q.options.filter(c=>c[0]===q.country[0]).length,1);}
  }
 }
});
