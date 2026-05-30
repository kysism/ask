import { supabase } from "../../js/common/supabaseClient.js";

let editId = null;
const API = "/api/survey-item";

// LOAD SURVEY LIST
async function loadSurvey() {
  const res = await fetch("/api/survey-title");
  const result = await res.json();

  let html = `<option value="">Select Survey</option>`;

  result.data.forEach((r) => {
    html += `<option value="${r.survey_id}">${r.survey_title}</option>`;
  });

  document.getElementById("survey_id").innerHTML = html;
}

// LOAD ITEMS
window.loadItem = async function () {
  const survey_id = document.getElementById("survey_id").value;

  let url = API;
  if (survey_id) url += `?survey_id=${survey_id}`;

  const res = await fetch(url);
  const result = await res.json();

  const data = result.data || [];

  let html = "";

  data.forEach((r) => {
    html += `
      <tr>
        <td>${r.survey_item_id}</td>
        <td>${r.tbl_survey?.survey_title}</td>
        <td>${r.survey_item}</td>
        <td>${r.survey_item_type}</td>
        <td>${r.survey_item_mandatory}</td>
        <td>
          <button onclick="editItem(${r.survey_item_id}, '${r.survey_item}', ${r.survey_id}, '${r.survey_item_type}', ${r.survey_item_mandatory})">Edit</button>
          <button onclick="deleteItem(${r.survey_item_id})">Delete</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("itemBody").innerHTML = html;
};

// SAVE
window.saveItem = async function () {
  const body = {
    survey_id: document.getElementById("survey_id").value,
    survey_item: document.getElementById("survey_item").value,
    survey_item_type: document.getElementById("survey_item_type").value,
    survey_item_mandatory:
      document.getElementById("survey_item_mandatory").value === "true",
  };

  let res;

  if (editId) {
    res = await fetch(`${API}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  editId = null;
  resetForm();
  loadItem();
};

// EDIT
window.editItem = function (id, item, survey_id, type, mandatory) {
  editId = id;

  document.getElementById("survey_item").value = item;
  document.getElementById("survey_id").value = survey_id;
  document.getElementById("survey_item_type").value = type;
  document.getElementById("survey_item_mandatory").value = String(mandatory);

  document.getElementById("saveBtn").innerText = "Update Item";
};

// DELETE
window.deleteItem = async function (id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadItem();
};

// RESET
window.resetForm = function () {
  editId = null;

  document.getElementById("survey_item").value = "";
  document.getElementById("survey_item_type").value = "S";
  document.getElementById("survey_item_mandatory").value = "true";

  document.getElementById("saveBtn").innerText = "Add Item";
};

loadSurvey();
loadItem();
