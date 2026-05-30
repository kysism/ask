import { supabase } from "../../js/common/supabaseClient.js";

const survey_id = new URLSearchParams(location.search).get("survey_id");

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
  } catch (e) {
    return "unknown";
  }
}

/* =========================
         CHECK DUPLICATE
      ========================= */
async function checkDuplicate() {
  const ip = await getIp();

  const { data } = await supabase
    .from("tbl_result")
    .select("id")
    .eq("survey_id", survey_id)
    .eq("ip_address", ip)
    .limit(1);

  if (data && data.length > 0) {
    document.getElementById("surveyBox").innerHTML = `
            <div class="block-box">

              <h2>
                Survey Already Submitted
              </h2>

              <p>
                You already completed this survey.
                <br /><br />

                لقد قمت بالإجابة على هذا الاستبيان من قبل
              </p>

            </div>
          `;

    return true;
  }

  return false;
}

/* =========================
         LOAD TITLE
      ========================= */
async function loadTitle() {
  const { data } = await supabase
    .from("tbl_survey")
    .select("*")
    .eq("survey_id", survey_id)
    .single();

  if (!data) return;

  document.getElementById("surveyTitle").innerText = data.survey_title;
}

/* =========================
         LOAD QUESTIONS
      ========================= */
async function loadQuestions() {
  const duplicated = await checkDuplicate();

  if (duplicated) return;

  const { data } = await supabase
    .from("tbl_survey_item")
    .select("*")
    .eq("survey_id", survey_id)
    .order("survey_item_id");

  questions = data || [];

  let html = "";

  questions.forEach((q, idx) => {
    const required = q.survey_item_mandatory
      ? `<span class="required">*</span>`
      : "";

    /* SUBJECTIVE */
    if (q.survey_item_type === "I") {
      html += `
              <div class="question-card">

                <div class="question-title">
                  ${idx + 1}. ${q.survey_item}
                  ${required}
                </div>

                <textarea
                  placeholder="Write your answer here | اكتب إجابتك هنا"
                  oninput="setAnswer(${q.survey_item_id}, this.value)"
                ></textarea>

              </div>
            `;
    } else {
      /* OBJECTIVE */
      const options = [
        ["1", "Very Bad", "سيء جدا"],
        ["2", "Bad", "سيء"],
        ["3", "Normal", "عادي"],
        ["4", "Good", "جيد"],
        ["5", "Very Good", "ممتاز"],
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
                          <br />
                          ${o[2]}
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
              |
              إرسال الاستبيان
            </button>

          </div>
        `;

  document.getElementById("surveyBox").innerHTML = html;
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
window.submitSurvey = async function () {
  for (const q of questions) {
    if (q.survey_item_mandatory && !answers[q.survey_item_id]) {
      alert("Please complete required fields | من فضلك أكمل الحقول المطلوبة");

      return;
    }
  }

  const ip = await getIp();

  const payload = Object.keys(answers).map((id) => ({
    survey_id,
    survey_item_id: id,
    survey_item_answer: answers[id],
    ip_address: ip,
  }));

  const { error } = await supabase.from("tbl_result").insert(payload);

  if (error) {
    alert("Save failed | فشل الحفظ");

    return;
  }

  document.getElementById("surveyBox").innerHTML = `
          <div class="thank-you">

            <h2>
              Thank You
              |
              شكرا لك
            </h2>

            <p>
              Thank you for answering the survey
              and giving your valuable time.
              <br /><br />

              شكرا لإجابتك على الاستبيان
              ولمنحنا وقتك الثمين
            </p>

          </div>
        `;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

loadTitle();
loadQuestions();
