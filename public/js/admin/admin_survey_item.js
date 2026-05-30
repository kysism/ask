const API = "/api/survey-item";
const SURVEY_API = "/api/survey-title";

let editItemId = null;

/* =========================
   LOAD SURVEY LIST
========================= */
async function loadSurvey() {
  const res = await fetch(SURVEY_API);
  const result = await res.json();

  const data = result.data || [];

  document.getElementById("survey_id").innerHTML =
    `<option value="">Select Survey</option>` +
    data
      .map((s) => `<option value="${s.survey_id}">${s.survey_title}</option>`)
      .join("");
}

/* =========================
   LOAD ITEMS
========================= */
async function loadItem() {
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
        <td>${r.tbl_survey?.survey_title || "-"}</td>
        <td>${r.survey_item}</td>
        <td>${r.survey_item_type}</td>
        <td>${r.survey_item_mandatory ? "Y" : "N"}</td>
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

/* =========================
   CLICK EVENTS
========================= */
document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;

  /* DELETE */
  if (e.target.classList.contains("delete-btn")) {
    if (!id) return;

    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    if (String(editItemId) === String(id)) resetForm();

    loadItem();
  }

  /* EDIT (FIX: no GET request anymore) */
  if (e.target.classList.contains("edit-btn")) {
    const row = e.target.closest("tr");

    const item = {
      survey_item_id: id,
      survey_item: row.children[2].innerText,
      survey_item_type: row.children[3].innerText,
      survey_item_mandatory: row.children[4].innerText === "Y",
      survey_title: row.children[1].innerText,
      survey_id: document.getElementById("survey_id").value,
    };

    editItem(
      item.survey_item_id,
      item.survey_item,
      item.survey_id,
      item.survey_item_type,
      item.survey_item_mandatory,
    );
  }
});

/* =========================
   SAVE
========================= */
async function saveItem() {
  const survey_id = document.getElementById("survey_id").value;
  const survey_item = document.getElementById("survey_item").value.trim();
  const survey_item_type = document.getElementById("survey_item_type").value;
  const survey_item_mandatory =
    document.getElementById("survey_item_mandatory").value === "true";

  if (!survey_id || !survey_item) {
    alert("Fill fields");
    return;
  }

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

  if (!result.success) {
    alert(result.message);
    return;
  }

  resetForm();
  loadItem();
}

/* =========================
   EDIT SET
========================= */
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

/* =========================
   RESET
========================= */
function resetForm() {
  editItemId = null;

  document.getElementById("survey_item").value = "";
  document.getElementById("survey_item_type").value = "S";
  document.getElementById("survey_item_mandatory").value = "true";

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Add Item";
  btn.classList.remove("btn-success");
}

/* =========================
   EVENTS INIT
========================= */
document.getElementById("survey_id").addEventListener("change", loadItem);

loadSurvey();
loadItem();

window.saveItem = saveItem;
window.editItem = editItem;
window.resetForm = resetForm;
