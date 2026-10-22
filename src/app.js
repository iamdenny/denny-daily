import { challenge, emoji, utcDay, validAnswers, stats } from "./logic.js";
const $ = (s) => document.querySelector(s),
  key = "denny-daily-v1";
let day = utcDay(),
  questions = challenge(day),
  state = { history: {}, day, answers: [] },
  reveal = false;
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && typeof saved === "object") {
    state.history =
      saved.history &&
      typeof saved.history === "object" &&
      !Array.isArray(saved.history)
        ? saved.history
        : {};
    if (saved.day === day)
      state.answers = validAnswers(saved.answers, questions);
  }
} catch {
  $("#storage-status").textContent =
    "Storage is unavailable. You can still play, but progress may not be saved.";
}
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    $("#storage-status").textContent =
      "Progress could not be saved in this browser.";
  }
}
function syncDay() {
  const now = utcDay();
  if (now !== day) {
    day = now;
    questions = challenge(day);
    state.day = day;
    state.answers = [];
    reveal = false;
    save();
    render();
    return false;
  }
  return true;
}
function render() {
  const n = state.answers.length,
    done = n === 5 && !reveal;
  $("#date").textContent = new Date(day + "T12:00:00Z").toLocaleDateString(
    "en",
    { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
  );
  $("#progress").style.width = (n / 5) * 100 + "%";
  $("#round").hidden = done;
  $("#result").hidden = !done;
  if (done) {
    const score = state.answers.filter(
      (a, i) => a === questions[i].country[0],
    ).length;
    state.history[day] = score;
    save();
    $("#result-title").textContent =
      `${score} out of 5. ${score === 5 ? "A perfect little journey!" : "A world worth exploring."}`;
    $("#result-description").textContent =
      "Here are the places you visited today.";
    $("#review").replaceChildren(
      ...questions.map((q, i) => {
        const p = document.createElement("p");
        p.textContent = `${state.answers[i] === q.country[0] ? "✓" : "○"} ${emoji(q.country[0])} ${q.country[1]}`;
        return p;
      }),
    );
  } else {
    const index = reveal ? n - 1 : n,
      q = questions[index];
    $("#question").textContent = `Question ${index + 1} of 5`;
    $("#flag").textContent = emoji(q.country[0]);
    $("#answers").replaceChildren(
      ...q.options.map((c) => {
        const b = document.createElement("button");
        b.textContent = c[1];
        b.disabled = reveal;
        if (reveal && c[0] === q.country[0]) b.className = "correct";
        if (reveal && c[0] === state.answers[index] && c[0] !== q.country[0])
          b.className = "wrong";
        b.addEventListener("click", () => {
          if (!syncDay() || reveal) return;
          state.answers.push(c[0]);
          reveal = true;
          save();
          render();
          $("#next").focus();
        });
        return b;
      }),
    );
    $("#feedback").textContent = reveal
      ? (state.answers[index] === q.country[0]
          ? "Correct! "
          : "Good to know: ") + `This is ${q.country[1]}.`
      : "";
    $("#next").hidden = !reveal;
    $("#next").textContent = n === 5 ? "See my result →" : "Next flag →";
  }
  const s = stats(state.history, day);
  for (const id of ["streak", "played"]) $("#" + id).textContent = s[id];
  $("#best").textContent = s.best + "/5";
}
$("#next").addEventListener("click", () => {
  if (!syncDay()) return;
  reveal = false;
  render();
  if (state.answers.length < 5) $("#answers button").focus();
  else $("#share").focus();
});
$("#share").addEventListener("click", async () => {
  const score = state.answers.filter(
    (a, i) => a === questions[i].country[0],
  ).length;
  const text = `Denny Daily · ${day}\n${state.answers.map((a, i) => (a === questions[i].country[0] ? "🟩" : "⬜")).join("")} ${score}/5\n${location.origin}/`;
  try {
    await navigator.clipboard.writeText(text);
    $("#share-status").textContent = "Score copied. Send it to a friend!";
  } catch {
    $("#share-status").textContent = text;
  }
});
$("#reset").addEventListener("click", () => {
  if (!confirm("Clear all daily scores and progress stored in this browser?"))
    return;
  state = { history: {}, day: utcDay(), answers: [] };
  day = state.day;
  questions = challenge(day);
  reveal = false;
  save();
  render();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncDay();
});
render();
