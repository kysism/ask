const API = "/api/survey-result";
const survey_id = new URLSearchParams(location.search).get("survey_id");

/* =========================
   SCORE COLOR MAP (SYNC)
========================= */
const SCORE_STYLE = {
  1: "#ef4444", // Very Bad (red)
  2: "#f97316", // Bad (orange)
  3: "#eab308", // Normal (yellow)
  4: "#22c55e", // Good (green)
  5: "#2563eb", // Very Good (blue)
};

/* =========================
   LOAD
========================= */
async function load() {
  try {
    if (!survey_id) {
      el("scoreTable").innerHTML = "No survey_id";
      return;
    }

    const res = await fetch(`${API}?survey_id=${survey_id}`);
    const result = await res.json();
    const data = result.data || [];

    const scoreMap = {};
    const textMap = {};
    const questionMap = {};
    const scoreDetail = {};

    /* =========================
       GROUP DATA
    ========================= */
    data.forEach((r) => {
      const item = r.tbl_survey_item;
      if (!item) return;

      const qName = item.survey_item;
      const type = item.survey_item_type;

      // question mapping (for Q1, Q2 ...)
      if (!questionMap[qName]) {
        const idx = Object.keys(questionMap).length + 1;
        questionMap[qName] = `Q${idx}`;
      }

      if (type === "S") {
        const val = Number(r.survey_item_answer || 0);

        // total score (for backward compatibility)
        scoreMap[qName] = (scoreMap[qName] || 0) + val;

        // distribution per level
        if (!scoreDetail[qName]) {
          scoreDetail[qName] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        }

        if (val >= 1 && val <= 5) {
          scoreDetail[qName][val]++;
        }
      } else {
        if (!textMap[qName]) textMap[qName] = [];
        textMap[qName].push(r.survey_item_answer);
      }
    });

    renderChart(scoreDetail, questionMap);
    renderScoreTable(scoreDetail, questionMap);
    renderText(textMap);
    renderQuestionMap(questionMap, data);
  } catch (err) {
    console.error(err);
    el("scoreTable").innerHTML = "Error loading data";
  }
}

/* =========================
   QUESTION MAP (RESTORED)
========================= */
function renderQuestionMap(map) {
  let html = `<div class="question-map">`;

  Object.entries(map).forEach(([q, label]) => {
    html += `
      <div class="q-item">
        <b>${label}</b> - ${q}
      </div>
    `;
  });

  html += `</div>`;

  const box = el("questionBox");
  if (box) box.innerHTML = html;
}

/* =========================
   CHART
========================= */
function renderChart(scoreDetail, questionMap) {
  const ctx = el("chart")?.getContext("2d");
  if (!ctx) return;

  const labels = Object.keys(scoreDetail).map((q) => questionMap[q] || q);

  const datasets = [1, 2, 3, 4, 5].map((level) => {
    return {
      label: `${level}`,
      data: Object.keys(scoreDetail).map((q) => scoreDetail[q][level] || 0),
      backgroundColor: SCORE_STYLE[level],
    };
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
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
}

/* =========================
   SCORE TABLE (Q1 STYLE + COLOR SYNC)
========================= */
function renderScoreTable(scoreDetail, questionMap) {
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

  Object.entries(scoreDetail).forEach(([q, dist]) => {
    const total = dist[1] + dist[2] + dist[3] + dist[4] + dist[5];

    html += `
      <tr>
        <td><b>${questionMap[q]}</b></td>
        ${[1, 2, 3, 4, 5]
          .map(
            (i) => `<td style="background:${SCORE_STYLE[i]}20">${dist[i]}</td>`,
          )
          .join("")}
        <td>${total}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  el("scoreTable").innerHTML = html;
}

/* =========================
   TEXT ANSWERS
========================= */
function renderText(textMap) {
  let html = "";

  Object.entries(textMap).forEach(([q, arr]) => {
    html += `
      <div class="text-group">
        <h4>${q}</h4>
    `;

    arr.forEach((v, i) => {
      html += `
        <div class="answer-item">
          <div class="answer-number">${i + 1}</div>
          <div class="answer-text">${v}</div>
        </div>
      `;
    });

    html += `</div>`;
  });

  el("textBox").innerHTML = html;
}

/* =========================
   HELPER
========================= */
function el(id) {
  return document.getElementById(id);
}

/* =========================
   INIT
========================= */
load();
