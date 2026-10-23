export const countries = [
  ["JP", "Japan"],
  ["KR", "South Korea"],
  ["US", "United States"],
  ["CA", "Canada"],
  ["BR", "Brazil"],
  ["AR", "Argentina"],
  ["MX", "Mexico"],
  ["GB", "United Kingdom"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["PT", "Portugal"],
  ["SE", "Sweden"],
  ["NO", "Norway"],
  ["FI", "Finland"],
  ["DK", "Denmark"],
  ["CH", "Switzerland"],
  ["GR", "Greece"],
  ["TR", "Türkiye"],
  ["AU", "Australia"],
  ["NZ", "New Zealand"],
  ["IN", "India"],
  ["CN", "China"],
  ["TH", "Thailand"],
  ["VN", "Vietnam"],
  ["ID", "Indonesia"],
  ["PH", "Philippines"],
  ["SG", "Singapore"],
  ["MY", "Malaysia"],
  ["ZA", "South Africa"],
  ["KE", "Kenya"],
  ["NG", "Nigeria"],
  ["EG", "Egypt"],
  ["MA", "Morocco"],
  ["CL", "Chile"],
  ["CO", "Colombia"],
  ["PE", "Peru"],
  ["UA", "Ukraine"],
  ["PL", "Poland"],
];
export const practiceCountries = [...countries, ["MN", "Mongolia"], ["TW", "Taiwan"]];
export function emoji(code) {
  return [...code]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
}
export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function shuffle(a, r) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function challenge(day, codes = null, focusCode = null) {
  const pool = codes
    ? practiceCountries.filter((c) => codes.includes(c[0]))
    : countries;
  if (pool.length < 5) throw Error("At least five countries are required");
  let seed = 0;
  for (const c of day) seed = (Math.imul(seed, 31) + c.charCodeAt(0)) >>> 0;
  const r = random(seed);
  const ordered = shuffle(pool, r);
  const selected = focusCode ? [pool.find(c => c[0] === focusCode), ...ordered.filter(c => c[0] !== focusCode).slice(0,4)] : ordered.slice(0,5);
  if (selected.some(c => !c)) throw Error("Unknown focus flag");
  return selected
    .map((country) => ({
      country,
      options: shuffle(
        [
          country,
          ...shuffle(
            pool.filter((c) => c[0] !== country[0]),
            r,
          ).slice(0, 3),
        ],
        r,
      ),
    }));
}
export function validAnswers(answers, questions) {
  if (!Array.isArray(answers) || answers.length > 5) return [];
  if (
    answers.some((code, i) => !questions[i].options.some((o) => o[0] === code))
  )
    return [];
  return answers;
}
export function stats(history, today) {
  const dates = Object.keys(history)
    .filter(
      (d) =>
        /^\d{4}-\d{2}-\d{2}$/.test(d) &&
        d <= today &&
        Number.isInteger(history[d]) &&
        history[d] >= 0 &&
        history[d] <= 5,
    )
    .sort();
  const completed = new Set(dates);
  let cursor = new Date(today + "T00:00:00Z");
  if (!completed.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (completed.has(utcDay(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return {
    streak,
    played: dates.length,
    best: Math.max(0, ...dates.map((d) => history[d])),
  };
}
