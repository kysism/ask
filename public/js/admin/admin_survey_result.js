const API = "/api/survey-result";

const survey_id = new URLSearchParams(location.search).get("survey_id");

const SCORE_LABELS = {
  1: "Very Bad",
  2: "Bad",
  3: "Normal",
  4: "Good",
  5: "Very Good",
};

let chartInstance = null;

/* =========================
   LOAD
========================= */
async function load() {
  try {
    if (!survey_id) return;

    const res = await fetch(`${API}?survey_id=${survey_id}`);
    const result = await res.json();

    const data = result.data || [];

    const scoreMap = {};
    const textMap = {};

    const questionIndexMap = {};
    let qCounter = 1;

    /* =========================
       GROUPING
    ========================= */
    data.forEach((r) => {
      const item = r.tbl_survey_item;
      if (!item) return;

      const qKey = item.survey_item;

      if (!questionIndexMap[qKey]) {
        questionIndexMap[qKey] = `Q${qCounter++}`;
      }

      if (item.survey_item_type === "S") {
        const answer = Number(r.survey_item_answer);

        if (!scoreMap[qKey]) {
          scoreMap[qKey] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
        }

        if (answer >= 1 && answer <= 5) {
          scoreMap[qKey][answer]++;
          scoreMap[qKey].total++;
        }
      } else {
        if (!textMap[qKey]) textMap[qKey] = [];
        textMap[qKey].push(r.survey_item_answer);
      }
    });

    renderChart(scoreMap, questionIndexMap);
    renderTable(scoreMap, questionIndexMap);
    renderText(textMap, questionIndexMap);
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   CHART (Q1, Q2 only)
========================= */
function renderChart(scoreMap, qIndexMap) {
  const ctx = document.getElementById("chart");

  if (!ctx) return;

  const labels = Object.keys(scoreMap).map((q) => qIndexMap[q]);

  const datasets = [1, 2, 3, 4, 5].map((score) => ({
    label: SCORE_LABELS[score],
    data: Object.values(scoreMap).map((q) => q[score]),
  }));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
    },
  });
}

/* =========================
   TABLE (Q1 style + no wrap)
========================= */
function renderTable(scoreMap, qIndexMap) {
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

  Object.entries(scoreMap).forEach(([q, v]) => {
    html += `
      <tr>
        <td>${qIndexMap[q]}</td>
        <td>${v[1]}</td>
        <td>${v[2]}</td>
        <td>${v[3]}</td>
        <td>${v[4]}</td>
        <td>${v[5]}</td>
        <td>${v.total}</td>
      </tr>
    `;
  });

  html += "</tbody></table>";

  document.getElementById("scoreTable").innerHTML = html;
}

/* =========================
   TEXT
========================= */
function renderText(textMap, qIndexMap) {
  let html = "";

  Object.entries(textMap).forEach(([q, arr]) => {
    html += `
      <div class="text-group">
        <h4>${qIndexMap[q]}</h4>
        <div>
    `;

    arr.forEach((v, i) => {
      html += `
        <div class="answer-item">
          <div class="answer-number">${i + 1}</div>
          <div>${v}</div>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  document.getElementById("textBox").innerHTML = html;
}

/* =========================
   INIT
========================= */
load();
