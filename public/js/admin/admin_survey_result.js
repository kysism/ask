const API = "/api/survey-result";

const params = new URLSearchParams(location.search);

const survey_id = params.get("survey_id");
const org_id = params.get("org_id");
const class_id = params.get("class_id");

/* =========================
   SCORE COLOR MAP
========================= */
const SCORE_STYLE = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#2563eb",
};

/* =========================
   RAW DATA
========================= */
let rawData = [];

/* =========================
   RESPONSE KEY (guest_uuid ONLY)
========================= */
function makeResponseKey(r) {
  return r.guest_uuid ? `guest-${r.guest_uuid}` : "guest-unknown";
}

/* =========================
   LOAD
========================= */
async function load() {
  try {
    if (!survey_id) {
      el("scoreTable").innerHTML = "No survey_id";
      return;
    }

    const url =
      `${API}?survey_id=${survey_id}` +
      (org_id ? `&org_id=${org_id}` : "") +
      (class_id ? `&class_id=${class_id}` : "");

    const res = await fetch(url);
    const result = await res.json();

    const data = result.data || [];

    rawData = data;

    buildRespondentSelect(data);

    const textMap = {};
    const questionMap = {};
    const scoreDetail = {};

    data.forEach((r) => {
      const item = r.tbl_survey_item;
      if (!item) return;

      const qName = item.survey_item;
      const type = item.survey_item_type;

      if (!questionMap[qName]) {
        const idx = Object.keys(questionMap).length + 1;
        questionMap[qName] = `Q${idx}`;
      }

      if (type === "S") {
        const val = Number(r.survey_item_answer || 0);

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

    const hasScoreData = Object.keys(scoreDetail).length > 0;

    if (hasScoreData) {
      renderChart(scoreDetail, questionMap);
      renderScoreTable(scoreDetail, questionMap);
    } else {
      const chartCard = el("chartCard");
      const scoreCard = el("scoreCard");

      if (chartCard) chartCard.style.display = "none";
      if (scoreCard) scoreCard.style.display = "none";
    }

    renderText(textMap);
    renderQuestionMap(questionMap);
  } catch (err) {
    console.error(err);
    el("scoreTable").innerHTML = "Error loading data";
  }
}

/* =========================
   RESPONDENT SELECT
========================= */
function buildRespondentSelect(data) {
  const map = {};

  data.forEach((r) => {
    const key = makeResponseKey(r);

    if (!map[key]) {
      map[key] = {
        key,
        label: r.guest_uuid
          ? `Guest ${r.guest_uuid.slice(0, 8)}`
          : "Guest unknown",
      };
    }
  });

  const select = document.getElementById("respondentSelect");
  if (!select) return;

  select.innerHTML =
    `<option value="">Select Respondent</option>` +
    Object.values(map)
      .map((u) => `<option value="${u.key}">${u.label}</option>`)
      .join("");

  select.onchange = () => {
    if (select.value) openRespondentModal(select.value);
  };
}

/* =========================
   MODAL OPEN
========================= */
function openRespondentModal(key) {
  const modal = document.getElementById("modal");
  const frame = document.getElementById("modalFrame");

  frame.src = `/html/admin/admin_survey_response.html?key=${encodeURIComponent(key)}&survey_id=${survey_id}`;

  modal.style.display = "flex";
}

/* =========================
   MODAL CLOSE
========================= */
function closeModal() {
  const modal = document.getElementById("modal");
  const frame = document.getElementById("modalFrame");

  modal.style.display = "none";
  frame.src = "";
}

/* =========================
   QUESTION MAP
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

  const datasets = [1, 2, 3, 4, 5].map((level) => ({
    label: `${level}`,
    data: Object.keys(scoreDetail).map((q) => scoreDetail[q][level] || 0),
    backgroundColor: SCORE_STYLE[level],
  }));

  new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}

/* =========================
   SCORE TABLE
========================= */
function renderScoreTable(scoreDetail, questionMap) {
  let html = `
    <table class="result-table">
      <thead>
        <tr>
          <th>Question</th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
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
    html += `<div class="text-group"><h4>${q}</h4>`;

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
