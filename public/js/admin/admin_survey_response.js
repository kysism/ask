const API = "/api/survey-result";

const survey_id = new URLSearchParams(location.search).get("survey_id");
const key = new URLSearchParams(location.search).get("key");

/* =========================
   RESPONSE KEY (UNIFIED)
========================= */
function makeResponseKey(r) {
  if (r.student_id) return `student-${r.student_id}`;
  if (r.guest_uuid) return `guest-${r.guest_uuid}`;
  return "guest-unknown";
}

/* =========================
   LOAD
========================= */
async function load() {
  try {
    const res = await fetch(`${API}?survey_id=${survey_id}`);
    const result = await res.json();

    const data = result.data || [];

    const filtered = data.filter((r) => makeResponseKey(r) === key);

    if (filtered.length === 0) {
      document.getElementById("contents").innerHTML =
        `<div class="question-card">No response found</div>`;
      return;
    }

    let html = "";

    filtered.forEach((r, idx) => {
      const q = r.tbl_survey_item?.survey_item || "Unknown Question";
      const ans = r.survey_item_answer ?? "-";

      html += `
        <div class="question-card">
          <div>${idx + 1}. ${q}</div>
          <div class="answer">${ans}</div>
        </div>
      `;
    });

    document.getElementById("contents").innerHTML = html;
  } catch (err) {
    console.error(err);
    document.getElementById("contents").innerHTML =
      `<div class="question-card">Error loading response</div>`;
  }
}

/* =========================
   INIT
========================= */
load();
