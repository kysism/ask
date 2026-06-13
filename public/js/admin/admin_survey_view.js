let currentSurveyId = null;
let surveyLink = "";
let resultLink = "";

/* =========================
   LOAD SURVEY LIST
========================= */
async function loadSurvey() {
  const res = await fetch("/api/survey-title");
  const result = await res.json();

  const data = result.data || [];

  let html = "";

  data.forEach((s) => {
    html += `
      <div class="item"
        onclick="selectSurvey(${s.survey_id}, '${s.survey_title}', this)">
        ${s.survey_title}
      </div>
    `;
  });

  document.getElementById("surveyList").innerHTML = html;
}

/* =========================
   LOAD META (ORG / CLASS )
========================= */
async function loadMeta() {
  const [orgRes, classRes] = await Promise.all([
    fetch("/api/org"),
    fetch("/api/class"),
  ]);

  const orgs = (await orgRes.json()).data || [];
  const classes = (await classRes.json()).data || [];

  document.getElementById("orgSelect").innerHTML =
    `<option value="">Select Organization</option>` +
    orgs
      .map((o) => `<option value="${o.org_id}">${o.org_nm}</option>`)
      .join("");

  document.getElementById("classSelect").innerHTML =
    `<option value="">Select Class</option>` +
    classes
      .map((c) => `<option value="${c.class_id}">${c.class_nm}</option>`)
      .join("");

  // 🔥 추가: 선택 변경 시 링크 즉시 갱신
  document.getElementById("orgSelect").onchange = updateLinks;
  document.getElementById("classSelect").onchange = updateLinks;
}

/* =========================
   BUILD LINK
========================= */
function buildSurveyLink(id) {
  const org = document.getElementById("orgSelect").value;
  const cls = document.getElementById("classSelect").value;

  let url = `${location.origin}/html/client/survey_view.html?survey_id=${id}`;

  if (org) url += `&org=${org}`;
  if (cls) url += `&class=${cls}`;

  return url;
}

/* =========================
   BUILD RESULT LINK (FIX)
   → org/class 포함하도록 수정
========================= */
function buildResultLink(id) {
  const org_id = document.getElementById("orgSelect").value;
  const cls_id = document.getElementById("classSelect").value;

  let url = `${location.origin}/html/admin/admin_survey_result.html?survey_id=${id}`;

  if (org_id) url += `&org_id=${org_id}`;
  if (cls_id) url += `&class_id=${cls_id}`;

  return url;
}

/* =========================
   UPDATE LINKS (핵심 추가)
========================= */
function updateLinks() {
  if (!currentSurveyId) return;

  surveyLink = buildSurveyLink(currentSurveyId);
  resultLink = buildResultLink(currentSurveyId);

  document.getElementById("linkBox").innerText = "Survey URL: " + surveyLink;

  document.getElementById("resultBox").innerHTML = `
    <div style="font-size:12px;">
      <b>Result Page</b><br/>
      <a href="${resultLink}" target="_blank"
         style="color:#059669;font-weight:bold;">
        Open Result Dashboard →
      </a>
    </div>
  `;
}

/* =========================
   SELECT SURVEY
========================= */
window.selectSurvey = async function (id, title, el) {
  currentSurveyId = id;

  document.getElementById("title").innerText = title;

  document.querySelectorAll(".item").forEach((e) => {
    e.classList.remove("active");
  });

  el.classList.add("active");

  const res = await fetch(`/api/survey-item?survey_id=${id}`);
  const result = await res.json();

  const data = result.data || [];

  let html = "";

  data.forEach((q) => {
    html += `
      <div class="q-item">
        • ${q.survey_item}
      </div>
    `;
  });

  document.getElementById("questionList").innerHTML = html;

  // 🔥 여기서도 항상 최신 링크 생성
  updateLinks();
};

/* =========================
   COPY LINK
========================= */
window.copyLink = function () {
  navigator.clipboard.writeText(surveyLink);
  alert("Survey link copied");
};

/* =========================
   INIT
========================= */
loadSurvey();
loadMeta();
