const API = "/api/survey-result";

const survey_id = new URLSearchParams(location.search).get("survey_id");
const key = new URLSearchParams(location.search).get("key");

/* =========================
   LOAD
========================= */
async function load() {
  try {
    const res = await fetch(`${API}?survey_id=${survey_id}`);
    const result = await res.json();

    const data = result.data || [];

    const filtered = data.filter((r) => {
      const k = r.student_id || r.ip_address || "guest";
      return k === key;
    });

    let html = "";

    filtered.forEach((r, idx) => {
      const q = r.tbl_survey_item?.survey_item;
      const ans = r.survey_item_answer;

      html += `
        <div class="question-card">
          <div>${idx + 1}. ${q}</div>
          <div class="answer">${ans}</div>
        </div>
      `;
    });

    document.getElementById("box").innerHTML = html;
  } catch (err) {
    console.error(err);
    document.getElementById("box").innerHTML =
      "<div>Error loading response</div>";
  }
}

/* =========================
   INIT
========================= */
load();
