const API = "/api/survey";

const survey_id = new URLSearchParams(location.search).get("survey_id");

let questions = [];
let answers = {};

/* =========================
   SAFE DOM
========================= */
function el(id) {
  return document.getElementById(id);
}

/* =========================
   GET IP (서버로 옮겨도 됨)
========================= */
async function getIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return "unknown";
  }
}

/* =========================
   LOAD TITLE (NODE API)
========================= */
async function loadTitle() {
  if (!survey_id) return;

  const res = await fetch(`${API}/title?survey_id=${survey_id}`);
  const result = await res.json();

  if (result?.data && el("surveyTitle")) {
    el("surveyTitle").innerText = result.data.survey_title;
  }
}

/* =========================
   LOAD QUESTIONS (NODE API)
========================= */
async function loadQuestions() {
  const box = el("surveyBox");
  if (!box) return;

  const res = await fetch(`${API}/items?survey_id=${survey_id}`);
  const result = await res.json();

  questions = result.data || [];

  let html = "";

  questions.forEach((q, idx) => {
    const required = q.survey_item_mandatory ? "*" : "";

    if (q.survey_item_type === "I") {
      html += `
        <div class="question-card">
          <div class="question-title">
            ${idx + 1}. ${q.survey_item} ${required}
          </div>

          <textarea
            oninput="setAnswer(${q.survey_item_id}, this.value)"
          ></textarea>
        </div>
      `;
    } else {
      const options = [
        ["1", "Very Bad"],
        ["2", "Bad"],
        ["3", "Normal"],
        ["4", "Good"],
        ["5", "Very Good"],
      ];

      html += `
        <div class="question-card">
          <div class="question-title">
            ${idx + 1}. ${q.survey_item} ${required}
          </div>

          <div class="scale-grid">
            ${options
              .map(
                (o) => `
              <div class="scale-option">
                <input
                  type="radio"
                  name="q_${q.survey_item_id}"
                  onchange="setAnswer(${q.survey_item_id}, '${o[0]}')"
                />

                <label>
                  <div>${o[0]}</div>
                  <div>${o[1]}</div>
                </label>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
    }
  });

  html += `
    <button onclick="submitSurvey()">Submit</button>
  `;

  box.innerHTML = html;
}

/* =========================
   ANSWERS
========================= */
window.setAnswer = function (id, value) {
  answers[id] = value;
};

/* =========================
   SUBMIT (NODE API)
========================= */
window.submitSurvey = async function () {
  const ip = await getIp();

  const payload = Object.keys(answers).map((id) => ({
    survey_id,
    survey_item_id: id,
    survey_item_answer: answers[id],
    ip_address: ip,
  }));

  const res = await fetch("/api/survey/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!result.success) {
    alert("Save failed");
    return;
  }

  el("surveyBox").innerHTML = `<div>Thank You</div>`;
};

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadTitle();
  loadQuestions();
});
