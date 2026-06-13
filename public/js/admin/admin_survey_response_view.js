const API = "/api/survey-response-detail";

const survey_id = new URLSearchParams(location.search).get("survey_id");
const survey_submit_id = new URLSearchParams(location.search).get(
  "survey_submit_id",
);

async function load() {
  const res = await fetch(
    `${API}?survey_id=${survey_id}&survey_submit_id=${survey_submit_id}`,
  );

  const result = await res.json();
  const data = result.data || [];

  let html = "";

  data.forEach((r, idx) => {
    const q = r.tbl_survey_item?.survey_item;
    const type = r.tbl_survey_item?.survey_item_type;
    const ans = r.survey_item_answer;

    html += `
      <div class="question-card">
        <div>${idx + 1}. ${q}</div>
        <div class="answer">${ans}</div>
      </div>
    `;
  });

  document.getElementById("box").innerHTML = html;
}

load();
