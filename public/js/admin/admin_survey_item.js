const API = "/api/survey-item";
const SURVEY_API = "/api/survey-title";

let editItemId = null;

/* LOAD SURVEY */
async function loadSurvey() {
  const res = await fetch(SURVEY_API);
  const result = await res.json();

  const data = result.data || [];

  let html = `<option value="">Select Survey</option>`;

  data.forEach((s) => {
    html += `<option value="${s.survey_id}">${s.survey_title}</option>`;
  });

  document.getElementById("survey_id").innerHTML = html;
}

/* LOAD ITEMS */
async function loadItem() {
  const survey_id = document.getElementById("survey_id").value;

  let url = API;
  if (survey_id) url += `?survey_id=${survey_id}`;

  const res = await fetch(url);
  const result = await res.json();

  const data = result.data || [];

  let html = "";

  data.forEach((r) => {
    const typeLabel = r.survey_item_type === "S" ? "Select" : "Input";

    const requiredLabel = r.survey_item_mandatory
      ? `<span class="required-badge">Required</span>`
      : `<span class="optional-badge">Optional</span>`;

    html += `
      <tr>
        <td>${r.survey_item_id}</td>

        <td>${r.tbl_survey?.survey_title ?? "-"}</td>

        <td>${r.survey_item}</td>

        <td>
          <span class="type-badge">${typeLabel}</span>
        </td>

        <td>${requiredLabel}</td>

        <td>
          <button class="btn-warning edit-btn" data-id="${r.survey_item_id}">
            Edit
          </button>
          <button class="btn-danger delete-btn" data-id="${r.survey_item_id}">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById("itemBody").innerHTML = html;
}

/* EVENT */
document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains("edit-btn")) {
    const res = await fetch(`${API}/${id}`);
    const result = await res.json();

    const d = result.data;

    editItem(
      d.survey_item_id,
      d.survey_item,
      d.survey_id,
      d.survey_item_type,
      d.survey_item_mandatory,
    );
  }

  if (e.target.classList.contains("delete-btn")) {
    await fetch(`${API}/${id}`, { method: "DELETE" });

    if (editItemId === id) resetForm();

    loadItem();
  }
});

/* SAVE */
async function saveItem() {
  const survey_id = document.getElementById("survey_id").value;
  const survey_item = document.getElementById("survey_item").value.trim();
  const survey_item_type = document.getElementById("survey_item_type").value;
  const survey_item_mandatory =
    document.getElementById("survey_item_mandatory").value === "true";

  if (!survey_id || !survey_item) return alert("Fill fields");

  let res;

  if (editItemId) {
    res = await fetch(`${API}/${editItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        survey_id,
        survey_item,
        survey_item_type,
        survey_item_mandatory,
      }),
    });
  } else {
    res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        survey_id,
        survey_item,
        survey_item_type,
        survey_item_mandatory,
      }),
    });
  }

  const result = await res.json();

  if (!result.success) return alert(result.message);

  resetForm();
  loadItem();
}

/* EDIT */
function editItem(id, item, survey_id, type, mandatory) {
  editItemId = id;

  document.getElementById("survey_item").value = item;
  document.getElementById("survey_id").value = survey_id;
  document.getElementById("survey_item_type").value = type;
  document.getElementById("survey_item_mandatory").value = String(mandatory);

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Update Item";
  btn.classList.add("btn-success");

  window.scrollTo({ top: 0 });
}

/* RESET */
function resetForm() {
  editItemId = null;

  document.getElementById("survey_item").value = "";
  document.getElementById("survey_item_type").value = "S";
  document.getElementById("survey_item_mandatory").value = "true";

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Add Item";
  btn.classList.remove("btn-success");
}

document.getElementById("survey_id").addEventListener("change", loadItem);

loadSurvey();
loadItem();

window.saveItem = saveItem;
window.editItem = editItem;
window.resetForm = resetForm;
