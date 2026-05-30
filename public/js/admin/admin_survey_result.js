const API = "/api/survey-result";

const survey_id = new URLSearchParams(location.search).get("survey_id");

async function load() {
  const res = await fetch(`${API}?survey_id=${survey_id}`);
  const result = await res.json();

  const data = result.data || [];

  let scoreMap = {};
  let textMap = {};

  data.forEach((r) => {
    const item = r.tbl_survey_item;
    if (!item) return;

    if (item.survey_item_type === "S") {
      scoreMap[item.survey_item] =
        (scoreMap[item.survey_item] || 0) + Number(r.survey_item_answer || 0);
    } else {
      if (!textMap[item.survey_item]) textMap[item.survey_item] = [];
      textMap[item.survey_item].push(r.survey_item_answer);
    }
  });

  document.getElementById("scoreTable").innerHTML = Object.entries(scoreMap)
    .map(([k, v]) => `<div>${k}: ${v}</div>`)
    .join("");

  document.getElementById("textBox").innerHTML = Object.entries(textMap)
    .map(
      ([k, arr]) => `
          <div>
            <h4>${k}</h4>
            ${arr.map((v) => `<div>${v}</div>`).join("")}
          </div>
        `,
    )
    .join("");
}

load();
