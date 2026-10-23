import { packs } from "./packs.js";
import { t, locale, country, preset } from "./i18n.js";
import { challenge, emoji, utcDay, validAnswers, stats } from "./logic.js";
const practice = packs.find((p) => p.id === preset.pack);
const makeChallenge = (day) => challenge(day, practice?.codes, practice?.focusCode);
const $ = (s) => document.querySelector(s),
  key = "denny-daily-v1";
let day = utcDay(),
  questions = makeChallenge(day),
  state = { history: {}, day, answers: [] },
  reveal = false;
try {
  const saved = practice ? null : JSON.parse(localStorage.getItem(key));
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
  $("#storage-status").textContent = t(
    "Storage is unavailable. You can still play, but progress may not be saved.",
  );
}
function save() {
  if (practice) return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    $("#storage-status").textContent = t(
      "Progress could not be saved in this browser.",
    );
  }
}
function syncDay() {
  if (practice) return true;
  const now = utcDay();
  if (now !== day) {
    day = now;
    questions = makeChallenge(day);
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
    locale,
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
    $("#result-title").textContent = t("{score} out of 5. {message}", {
      score,
      message:
        score === 5
          ? t("A perfect little journey!")
          : t("A world worth exploring."),
    });
    $("#result-description").textContent = t(
      "Here are the places you visited today.",
    );
    $("#review").replaceChildren(
      ...questions.map((q, i) => {
        const p = document.createElement("p");
        p.textContent = `${state.answers[i] === q.country[0] ? "✓" : "○"} ${emoji(q.country[0])} ${country(q.country[0], q.country[1])}`;
        return p;
      }),
    );
  } else {
    const index = reveal ? n - 1 : n,
      q = questions[index];
    $("#question").textContent = t("Question {n} of 5", { n: index + 1 });
    $("#flag").textContent = emoji(q.country[0]);
    $("#answers").replaceChildren(
      ...q.options.map((c) => {
        const b = document.createElement("button");
        b.textContent = country(c[0], c[1]);
        b.disabled = reveal;
        if (reveal && c[0] === q.country[0]) b.className = "correct";
        if (reveal && c[0] === state.answers[index] && c[0] !== q.country[0])
          b.className = "wrong";
        b.addEventListener("click", () => {
          if (!syncDay() || reveal) return;
          if (state.answers.length === 0) window.dennyTrack?.("start_quiz");
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
          ? t("Correct! ")
          : t("Good to know: ")) +
        t("This is {country}.", {
          country: country(q.country[0], q.country[1]),
        })
      : "";
    $("#next").hidden = !reveal;
    $("#next").textContent = n === 5 ? t("See my result →") : t("Next flag →");
  }
  const s = stats(state.history, day);
  for (const id of ["streak", "played"]) $("#" + id).textContent = s[id];
  $("#best").textContent = s.best + "/5";
}
$("#next").addEventListener("click", () => {
  if (!syncDay() || !reveal) return;
  if (state.answers.length === 5) window.dennyTrack?.("finish_quiz");
  reveal = false;
  render();
  if (state.answers.length < 5) $("#answers button").focus();
  else $("#share").focus();
});
$("#share").addEventListener("click", async () => {
  const score = state.answers.filter(
    (a, i) => a === questions[i].country[0],
  ).length;
  const text = `Denny Daily · ${day}\n${state.answers.map((a, i) => (a === questions[i].country[0] ? "🟩" : "⬜")).join("")} ${score}/5\n${location.origin}${location.pathname}`;
  try {
    await navigator.clipboard.writeText(text);
    $("#share-status").textContent = t("Score copied. Send it to a friend!");
  } catch {
    $("#share-status").textContent = text;
  }
});
$("#reset").addEventListener("click", () => {
  if (
    !confirm(t("Clear all daily scores and progress stored in this browser?"))
  )
    return;
  state = { history: {}, day: utcDay(), answers: [] };
  day = state.day;
  questions = makeChallenge(day);
  reveal = false;
  save();
  render();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncDay();
});
render();

$("#practice-again")?.addEventListener("click", () => {
  questions = makeChallenge(
    day + ":" + crypto.getRandomValues(new Uint32Array(1))[0],
  );
  state.answers = [];
  reveal = false;
  render();
  $("#answers button").focus();
});
