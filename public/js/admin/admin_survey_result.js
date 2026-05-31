const API = "/api/survey-result";

const survey_id = new URLSearchParams(location.search).get("survey_id");

let chartInstance = null;

/* =========================
   LOAD
========================= */
async function load() {
  try {
    const res = await fetch(`${API}?survey_id=${survey_id}`);

    const result = await res.json();

    const data = result.data || [];

    const scoreMap = {};
    const textMap = {};

    data.forEach((r) => {
      const item = r.tbl_survey_item;

      if (!item) return;

      const title = item.survey_item;

      if (item.survey_item_type === "S") {
        if (!scoreMap[title]) {
          scoreMap[title] = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };
        }

        const score = Number(r.survey_item_answer);

        if (score >= 1 && score <= 5) {
          scoreMap[title][score]++;
        }
      } else {
        if (!textMap[title]) {
          textMap[title] = [];
        }

        textMap[title].push(r.survey_item_answer || "");
      }
    });

    renderChart(scoreMap);
    renderTable(scoreMap);
    renderText(textMap);
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   CHART
========================= */
function renderChart(scoreMap) {
  const canvas = document.getElementById("chart");

  const ctx = canvas.getContext("2d");

  const labels = Object.keys(scoreMap);

  const datasets = [1, 2, 3, 4, 5].map((score) => ({
    label:
      score +
      " - " +
      ["", "Very Bad", "Bad", "Normal", "Good", "Very Good"][score],

    data: labels.map((q) => scoreMap[q][score]),
  }));

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

/* =========================
   TABLE
========================= */
function renderTable(scoreMap) {
  let html = `
    <table class="result-table">

      <thead>
        <tr>
          <th>Question</th>
          <th>1 Very Bad</th>
          <th>2 Bad</th>
          <th>3 Normal</th>
          <th>4 Good</th>
          <th>5 Very Good</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
  `;

  Object.entries(scoreMap).forEach(([question, score]) => {
    const total = score[1] + score[2] + score[3] + score[4] + score[5];

    html += `
        <tr>
          <td>${question}</td>

          <td>${score[1]}</td>
          <td>${score[2]}</td>
          <td>${score[3]}</td>
          <td>${score[4]}</td>
          <td>${score[5]}</td>

          <td>${total}</td>
        </tr>
      `;
  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById("scoreTable").innerHTML = html;
}

/* =========================
   TEXT ANSWERS
========================= */
function renderText(textMap) {
  let html = "";

  Object.entries(textMap).forEach(([question, answers]) => {
    html += `
        <div class="text-group">

          <h4>${question}</h4>

          <div class="answer-list">
      `;

    answers.forEach((answer, idx) => {
      html += `
          <div class="answer-item">

            <div class="answer-number">
              ${idx + 1}
            </div>

            <div class="answer-text">
              ${answer}
            </div>

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
