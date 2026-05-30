import { supabase } from "../../js/common/supabaseClient.js";

const survey_id = new URLSearchParams(location.search).get("survey_id");

async function load() {
  const { data } = await supabase
    .from("tbl_result")
    .select(
      `
            *,
            tbl_survey_item(survey_item, survey_item_type)
          `,
    )
    .eq("survey_id", survey_id);

  let scoreMap = {};
  let textMap = {};

  /* DATA GROUPING */
  data.forEach((r) => {
    const item = r.tbl_survey_item;

    if (item.survey_item_type === "S") {
      scoreMap[item.survey_item] =
        (scoreMap[item.survey_item] || 0) + Number(r.survey_item_answer || 0);
    } else {
      if (!textMap[item.survey_item]) textMap[item.survey_item] = [];
      textMap[item.survey_item].push(r.survey_item_answer);
    }
  });

  /* CHART */
  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels: Object.keys(scoreMap),
      datasets: [
        {
          label: "Score",
          data: Object.values(scoreMap),
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });

  /* TABLE */
  let tableHtml = `
          <table class="result-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Total Score</th>
              </tr>
            </thead>
            <tbody>
        `;

  Object.keys(scoreMap).forEach((k) => {
    tableHtml += `
            <tr>
              <td>${k}</td>
              <td>${scoreMap[k]}</td>
            </tr>
          `;
  });

  tableHtml += `
            </tbody>
          </table>
        `;

  document.getElementById("scoreTable").innerHTML = tableHtml;

  /* TEXT ANSWERS */
  let html = "";

  Object.keys(textMap).forEach((k) => {
    html += `
            <div class="text-group">
              <h4>${k}</h4>
              <div class="answer-list">
          `;

    textMap[k].forEach((v, idx) => {
      html += `
              <div class="answer-item">
                <div class="answer-number">${idx + 1}</div>
                <div class="answer-text">${v}</div>
              </div>
            `;
    });

    html += `
              </div>
            </div>
          `;
  });

  document.getElementById("textBox").innerHTML = html;
}

load();
