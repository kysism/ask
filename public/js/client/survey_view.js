const API = "/api/survey";

const survey_id = new URLSearchParams(location.search).get("survey_id");

let questions = [];
let answers = {};

/* =========================
   PREVENT BACK
========================= */
history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

/* =========================
   SAFE DOM
========================= */
function el(id) {
  return document.getElementById(id);
}

/* =========================
   GUEST UUID (NEW 핵심)
========================= */
function getGuestId() {
  let id = localStorage.getItem("guest_uuid");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("guest_uuid", id);
  }

  return id;
}

/* =========================
   CHECK DUPLICATE (NEW 방식)
========================= */
async function checkDuplicate() {
  try {
    const guest_uuid = getGuestId();

    const res = await fetch(
      `${API}/check?survey_id=${survey_id}&guest_uuid=${guest_uuid}`,
    );

    const result = await res.json();

    if (result.duplicated) {
      el("surveyBox").innerHTML = `
        <div class="block-box">
          <h2>Survey Already Submitted</h2>
          <p>You already completed this survey.</p>
        </div>
      `;
      return true;
    }

    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/* =========================
   LOAD TITLE
========================= */
async function loadTitle() {
  try {
    const res = await fetch(`${API}/title?survey_id=${survey_id}`);
    const result = await res.json();

    if (result.success && result.data) {
      el("surveyTitle").innerText = result.data.survey_title;
    }
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   LOAD QUESTIONS
========================= */
async function loadQuestions() {
  const duplicated = await checkDuplicate();
  if (duplicated) return;

  try {
    const res = await fetch(`${API}/items?survey_id=${survey_id}`);
    const result = await res.json();

    questions = result.data || [];

    let html = "";

    questions.forEach((q, idx) => {
      const required = q.survey_item_mandatory
        ? `<span class="required">*</span>`
        : "";

      if ((q.survey_item_type || "").toUpperCase() === "I") {
        html += `
          <div class="question-card">
            <div class="question-title">
              ${idx + 1}. ${q.survey_item}
              ${required}
            </div>

            <textarea
              placeholder="Write your answer here"
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
              ${idx + 1}. ${q.survey_item}
              ${required}
            </div>

            <div class="scale-grid">
              ${options
                .map(
                  (o) => `
                  <div class="scale-option">
                    <input
                      type="radio"
                      id="q_${q.survey_item_id}_${o[0]}"
                      name="q_${q.survey_item_id}"
                      value="${o[0]}"
                      onchange="setAnswer(${q.survey_item_id}, '${o[0]}')"
                    />
                    <label for="q_${q.survey_item_id}_${o[0]}">
                      <div class="scale-score">${o[0]}</div>
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
      <div class="submit-area">
        <button class="submit-btn" onclick="submitSurvey()">
          Submit Survey
        </button>
      </div>
    `;

    el("surveyBox").innerHTML = html;
  } catch (err) {
    console.error(err);

    el("surveyBox").innerHTML = `
      <div class="block-box">
        <h2>Load Failed</h2>
      </div>
    `;
  }
}

/* =========================
   SET ANSWER
========================= */
window.setAnswer = function (id, value) {
  answers[id] = value;
};

/* =========================
   SUBMIT (IMPORTANT CHANGE)
========================= */
window.submitSurvey = async function () {
  for (const q of questions) {
    if (q.survey_item_mandatory && !answers[q.survey_item_id]) {
      alert("Please complete required fields");
      return;
    }
  }

  const guest_uuid = getGuestId();

  const payload = Object.keys(answers).map((id) => ({
    survey_id,
    survey_item_id: id,
    survey_item_answer: answers[id],

    // 🔥 핵심 변경
    guest_uuid,
  }));

  try {
    const res = await fetch(`${API}/submit`, {
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

    el("surveyBox").innerHTML = `
      <div class="thank-you">
        <h2>Thank You</h2>
        <p>Thank you for answering the survey.</p>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
    alert("Save failed");
  }
};

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadTitle();
  loadQuestions();
});
