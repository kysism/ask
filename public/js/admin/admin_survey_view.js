import { supabase } from "../../js/common/supabaseClient.js";

let currentSurveyId = null;
let surveyLink = "";
let resultLink = "";

/* =========================
         LOAD SURVEY LIST
      ========================= */
async function loadSurvey() {
  const { data } = await supabase.from("tbl_survey").select("*");

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
         LOAD META (ORG / CLASS / STUDENT)
      ========================= */
async function loadMeta() {
  const { data: orgs } = await supabase.from("tbl_org").select("*");
  const { data: classes } = await supabase.from("tbl_class").select("*");
  const { data: students } = await supabase.from("tbl_student").select("*");

  document.getElementById("orgSelect").innerHTML =
    `<option value="">Select Organization</option>` +
    orgs.map((o) => `<option value="${o.id}">${o.name}</option>`).join("");

  document.getElementById("classSelect").innerHTML =
    `<option value="">Select Class</option>` +
    classes.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");

  document.getElementById("studentSelect").innerHTML =
    `<option value="">Select Student</option>` +
    students.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
}

/* =========================
         BUILD LINK
      ========================= */
function buildSurveyLink(id) {
  const org = document.getElementById("orgSelect").value;
  const cls = document.getElementById("classSelect").value;
  const student = document.getElementById("studentSelect").value;

  let url = `${location.origin}/html/client/survey_view.html?survey_id=${id}`;

  if (org) url += `&org=${org}`;
  if (cls) url += `&class=${cls}`;
  if (student) url += `&student=${student}`;

  return url;
}

/* =========================
         SELECT SURVEY
      ========================= */
window.selectSurvey = async function (id, title, el) {
  currentSurveyId = id;

  document.getElementById("title").innerText = title;

  document
    .querySelectorAll(".item")
    .forEach((e) => e.classList.remove("active"));

  el.classList.add("active");

  const { data } = await supabase
    .from("tbl_survey_item")
    .select("*")
    .eq("survey_id", id);

  let html = "";

  data.forEach((q) => {
    html += `
            <div class="q-item">
              • ${q.survey_item}
            </div>
          `;
  });

  document.getElementById("questionList").innerHTML = html;

  surveyLink = buildSurveyLink(id);

  resultLink = `${location.origin}/html/admin/admin_survey_result.html?survey_id=${id}`;

  document.getElementById("linkBox").innerText = "Survey URL: " + surveyLink;

  document.getElementById("resultBox").innerHTML = `
          <div style="font-size:12px;">
            <b>Result Page</b><br/>
            <a href="${resultLink}" target="_blank" style="color:#059669; font-weight:bold;">
              Open Result Dashboard →
            </a>
          </div>
        `;
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
