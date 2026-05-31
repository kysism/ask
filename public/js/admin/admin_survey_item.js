const API = "/api/survey-item";
const SURVEY_API = "/api/survey-title";

let editItemId = null;

/* =========================
   SAFE DOM
========================= */
function el(id) {
  return document.getElementById(id);
}

/* =========================
   LOAD SURVEY LIST
========================= */
async function loadSurvey(callback) {
  try {
    const res = await fetch(SURVEY_API);
    const result = await res.json();

    const data = result.data || [];

    const select = el("survey_id");

    select.innerHTML =
      `<option value="">Select Survey</option>` +
      data
        .map(
          (s) =>
            `<option value="${String(s.survey_id)}">${s.survey_title}</option>`,
        )
        .join("");

    if (callback) callback();
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   LOAD ITEMS
========================= */
async function loadItem() {
  const survey_id = el("survey_id").value;

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

  el("itemBody").innerHTML = html;
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

    alert("Deleted");

    if (String(editItemId) === String(id)) resetForm();

    loadItem();
  }

  /* EDIT */
  if (e.target.classList.contains("edit-btn")) {
    const row = e.target.closest("tr");

    const item = {
      survey_item_id: id,
      survey_item: row.children[2].innerText,
      survey_item_type: row.children[3].innerText,
      survey_item_mandatory: row.children[4].innerText === "Y",
      survey_id: el("survey_id").value,
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
   SAVE ITEM
========================= */
async function saveItem() {
  const survey_id = el("survey_id").value;
  const survey_item = el("survey_item").value.trim();
  const survey_item_type = el("survey_item_type").value;
  const survey_item_mandatory = el("survey_item_mandatory").value === "true";

  if (!survey_id || !survey_item) {
    alert("Fill fields");
    return;
  }

  let res;

  if (editItemId) {
    res = await fetch(`${API}/${editItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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

  alert("Saved");

  resetForm();
  loadItem();
}

/* =========================
   EDIT ITEM
========================= */
function editItem(id, item, survey_id, type, mandatory) {
  editItemId = id;

  el("survey_item").value = item;
  el("survey_item_type").value = type;
  el("survey_item_mandatory").value = String(mandatory);

  // FIX: select must match string value
  el("survey_id").value = String(survey_id);

  const btn = el("saveBtn");
  btn.innerText = "Update Item";
  btn.classList.remove("btn-primary");
  btn.classList.add("btn-success");

  window.scrollTo({ top: 0 });
}

/* =========================
   RESET FORM
========================= */
function resetForm() {
  editItemId = null;

  el("survey_item").value = "";
  el("survey_item_type").value = "S";
  el("survey_item_mandatory").value = "true";

  const btn = el("saveBtn");
  btn.innerText = "Add Item";

  btn.classList.remove("btn-success");
  btn.classList.add("btn-primary");
}

/* =========================
   EVENTS
========================= */
el("survey_id").addEventListener("change", loadItem);

/* =========================
   INIT
========================= */
loadSurvey();
loadItem();

/* =========================
   EXPORT
========================= */
window.saveItem = saveItem;
window.editItem = editItem;
window.resetForm = resetForm;
