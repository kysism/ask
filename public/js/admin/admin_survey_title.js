import { supabase } from "../../js/common/supabaseClient.js";

let editId = null;
const API = "/api/survey-title";

// LOAD
async function loadSurvey() {
  const res = await fetch(API);
  const result = await res.json();

  const data = result.data || [];

  let html = "";

  data.forEach((row) => {
    const status = row.use_yn
      ? `<span class="status-on">ON</span>`
      : `<span class="status-off">OFF</span>`;

    html += `
      <tr>
        <td>${row.survey_id}</td>
        <td>${row.survey_title}</td>
        <td>${status}</td>
        <td>
          <button onclick="editSurvey(${row.survey_id}, '${row.survey_title}', ${row.use_yn})">Edit</button>
          <button onclick="deleteSurvey(${row.survey_id})">Delete</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("surveyBody").innerHTML = html;
}

// SAVE
window.saveSurvey = async function () {
  const survey_title = document.getElementById("survey_title").value.trim();
  const use_yn = document.getElementById("use_yn").checked;

  if (!survey_title) return alert("required");

  let res;

  if (editId) {
    res = await fetch(`${API}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ survey_title, use_yn }),
    });
  } else {
    res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ survey_title, use_yn }),
    });
  }

  const result = await res.json();

  if (!result.success) return alert(result.message);

  resetForm();
  loadSurvey();
};

// EDIT
window.editSurvey = function (id, title, use_yn) {
  editId = id;

  document.getElementById("survey_title").value = title;
  document.getElementById("use_yn").checked = use_yn;

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Update Survey";
};

// DELETE
window.deleteSurvey = async function (id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  resetForm();
  loadSurvey();
};

// RESET
window.resetForm = function () {
  editId = null;

  document.getElementById("survey_title").value = "";
  document.getElementById("use_yn").checked = true;

  document.getElementById("saveBtn").innerText = "Add Survey";
};

loadSurvey();
