const API = "/api/survey";

const survey_id = new URLSearchParams(location.search).get("survey_id");
const org_id = new URLSearchParams(location.search).get("org_id");
const class_id = new URLSearchParams(location.search).get("class_id");

let questions = [];
let answers = {};

/* =========================
   PREVENT BACK
========================= */
history.pushState(null, null, location.href);

window.onpopstate = function () {
  history.go(1);
};

/* =========================
   GET USER IP
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
   SAFE DOM
========================= */
function el(id) {
  return document.getElementById(id);
}

function getGuestId() {
  let id = localStorage.getItem("guest_uuid");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("guest_uuid", id);
  }

  return id;
}

/* =========================
   CHECK DUPLICATE
========================= */
async function checkDuplicate() {
  try {
    const ip = await getIp();

    const res = await fetch(`${API}/check?survey_id=${survey_id}&ip=${ip}`);

    const result = await res.json();

    if (result.duplicated) {
      el("surveyBox").innerHTML = `
        <div class="block-box">
          <h2>Survey Already Submitted</h2>
          <p>
            You already completed this survey.
          </p>
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

      if (q.survey_item_type === "I") {
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

                      <div class="scale-score">
                        ${o[0]}
                      </div>

                      <div>
                        ${o[1]}
                      </div>

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

        <button
          class="submit-btn"
          onclick="submitSurvey()"
        >
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
   SUBMIT
========================= */
exports.submitSurvey = async (req, res) => {
  try {
    const { survey_id, guest_uuid, org_id, class_id, answers } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!survey_id || !answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    const ip = getClientIp(req);

    // =========================
    // DUPLICATE CHECK
    // =========================
    const { data: existing, error: dupErr } = await supabase
      .from("tbl_result")
      .select("id")
      .eq("survey_id", survey_id)
      .eq("ip_address", ip)
      .limit(1);

    if (dupErr) {
      console.error("DUP CHECK ERROR:", dupErr);
      throw dupErr;
    }

    if (existing?.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Already submitted",
      });
    }

    // =========================
    // FIX: answers OBJECT 대응
    // =========================
    const payload = Object.entries(answers).map(([item_id, value]) => ({
      survey_id,
      survey_item_id: Number(item_id),
      survey_item_answer: value,
      ip_address: ip,

      // optional meta
      org_id: org_id || null,
      class_id: class_id || null,
      guest_uuid: guest_uuid || null,
    }));

    console.log("INSERT PAYLOAD:", payload);

    // =========================
    // INSERT
    // =========================
    const { data, error } = await supabase
      .from("tbl_result")
      .insert(payload)
      .select();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
        details: error,
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("submitSurvey error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadTitle();
  loadQuestions();
});
