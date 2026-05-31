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

      const question = item.survey_item;

      if (item.survey_item_type === "S") {
        if (!scoreMap[question]) {
          scoreMap[question] = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };
        }

        const score = Number(r.survey_item_answer);

        if (score >= 1 && score <= 5) {
          scoreMap[question][score]++;
        }
      } else {
        if (!textMap[question]) {
          textMap[question] = [];
        }

        textMap[question].push(r.survey_item_answer || "");
      }
    });

    renderChart(scoreMap);
    renderQuestionLegend(scoreMap);
    renderTable(scoreMap);
    renderText(textMap);
  } catch (err) {
    console.error(err);

    document.getElementById("scoreTable").innerHTML =
      "<div style='color:red'>Failed to load data</div>";
  }
}

/* =========================
   CHART
========================= */
function renderChart(scoreMap) {
  const canvas = document.getElementById("chart");

  const ctx = canvas.getContext("2d");

  const questions = Object.keys(scoreMap);

  const labels = questions.map((_, idx) => `Q${idx + 1}`);

  const datasets = [1, 2, 3, 4, 5].map((score) => ({
    label:
      score +
      " - " +
      ["", "Very Bad", "Bad", "Normal", "Good", "Very Good"][score],

    data: questions.map((q) => scoreMap[q][score]),
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
   QUESTION LEGEND
========================= */
function renderQuestionLegend(scoreMap) {
  let html = `
    <table class="result-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Question</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.keys(scoreMap).forEach((question, idx) => {
    html += `
        <tr>
          <td>Q${idx + 1}</td>
          <td>${question}</td>
        </tr>
      `;
  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById("questionLegend").innerHTML = html;
}

/* =========================
   SCORE SUMMARY
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
   OPEN ANSWERS
========================= */
function renderText(textMap) {
  let html = "";

  Object.entries(textMap).forEach(([question, answers]) => {
    html += `
        <div class="text-group">
          <h4>${question}</h4>
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
      `;
  });

  document.getElementById("textBox").innerHTML = html;
}

/* =========================
   INIT
========================= */
load();
