const API = "/api/survey-result";

const survey_id = new URLSearchParams(location.search).get("survey_id");

/* =========================
   MAIN LOAD
========================= */
async function load() {
  try {
    if (!survey_id) {
      document.getElementById("scoreTable").innerHTML = "No survey_id found";
      return;
    }

    const res = await fetch(`${API}?survey_id=${survey_id}`);

    if (!res.ok) {
      throw new Error("API ERROR");
    }

    const result = await res.json();
    const data = result.data || [];

    let scoreMap = {};
    let textMap = {};

    /* =========================
       DATA GROUPING
    ========================= */
    data.forEach((r) => {
      const item = r.tbl_survey_item;

      if (!item) return;

      if (item.survey_item_type === "S") {
        scoreMap[item.survey_item] =
          (scoreMap[item.survey_item] || 0) + Number(r.survey_item_answer || 0);
      } else {
        if (!textMap[item.survey_item]) {
          textMap[item.survey_item] = [];
        }

        textMap[item.survey_item].push(r.survey_item_answer);
      }
    });

    /* =========================
       RENDER UI
    ========================= */
    renderChart(scoreMap);
    renderTable(scoreMap);
    renderText(textMap);
  } catch (err) {
    console.error("LOAD ERROR:", err);

    document.getElementById("scoreTable").innerHTML =
      "<div style='color:red'>Failed to load data</div>";

    document.getElementById("textBox").innerHTML = "";
  }
}

/* =========================
   CHART (SAFE VERSION)
========================= */
function renderChart(scoreMap) {
  const canvas = document.getElementById("chart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(scoreMap),
      datasets: [
        {
          label: "Score",
          data: Object.values(scoreMap),
          backgroundColor: "#2563eb",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

/* =========================
   SCORE TABLE
========================= */
function renderTable(scoreMap) {
  let html = `
    <table class="result-table">
      <thead>
        <tr>
          <th>Question</th>
          <th>Total Score</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(scoreMap).forEach(([k, v]) => {
    html += `
      <tr>
        <td>${k}</td>
        <td>${v}</td>
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

  Object.entries(textMap).forEach(([k, arr]) => {
    html += `
      <div class="text-group">
        <h4>${k}</h4>
        <div class="answer-list">
    `;

    arr.forEach((v, idx) => {
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

/* =========================
   INIT
========================= */
load();
