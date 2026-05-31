const API = "/api/survey-item";
const SURVEY_API = "/api/survey-title";

let editItemId = null;

/* =========================
   LOAD SURVEY LIST
========================= */
async function loadSurvey() {
  try {
    const res = await fetch(SURVEY_API);
    const result = await res.json();

    const data = result.data || [];

    document.getElementById("survey_id").innerHTML =
      `<option value="">Select Survey</option>` +
      data
        .map((s) => `<option value="${s.survey_id}">${s.survey_title}</option>`)
        .join("");
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   LOAD ITEMS
========================= */
async function loadItem() {
  const survey_id = document.getElementById("survey_id").value;

  let url = API;

  if (survey_id) {
    url += `?survey_id=${survey_id}`;
  }

  try {
    const res = await fetch(url);
    const result = await res.json();

    const data = result.data || [];

    let html = "";

    if (data.length === 0) {
      html = `
        <tr>
          <td colspan="6" style="text-align:center">
            No Data
          </td>
        </tr>
      `;
    }

    data.forEach((r) => {
      html += `
        <tr>
          <td>${r.survey_item_id}</td>

          <td>${r.tbl_survey?.survey_title || "-"}</td>

          <td>${r.survey_item}</td>

          <td>${r.survey_item_type}</td>

          <td>${r.survey_item_mandatory ? "Y" : "N"}</td>

          <td>

            <button
              class="btn-warning edit-btn"
              data-id="${r.survey_item_id}"
              data-surveyid="${r.survey_id}"
              data-item="${encodeURIComponent(r.survey_item)}"
              data-type="${r.survey_item_type}"
              data-mandatory="${r.survey_item_mandatory}"
            >
              Edit
            </button>

            <button
              class="btn-danger delete-btn"
              data-id="${r.survey_item_id}"
            >
              Delete
            </button>

          </td>
        </tr>
      `;
    });

    document.getElementById("itemBody").innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   CLICK EVENTS
========================= */
document.addEventListener("click", async (e) => {
  /* DELETE */
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;

    if (!confirm("Delete Item?")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      if (String(editItemId) === String(id)) {
        resetForm();
      }

      await loadItem();

      alert("Deleted");
    } catch (err) {
      console.error(err);
    }
  }

  /* EDIT */
  if (e.target.classList.contains("edit-btn")) {
    editItem(
      e.target.dataset.id,
      decodeURIComponent(e.target.dataset.item),
      e.target.dataset.surveyid,
      e.target.dataset.type,
      e.target.dataset.mandatory === "true",
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

  try {
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

    resetForm();

    await loadItem();

    alert("Saved");
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   EDIT
========================= */
function editItem(id, item, survey_id, type, mandatory) {
  editItemId = id;

  document.getElementById("survey_item").value = item;

  document.getElementById("survey_item_type").value = type;

  document.getElementById("survey_item_mandatory").value = String(mandatory);

  document.getElementById("survey_id").value = String(survey_id);

  console.log("EDIT SURVEY ID =", survey_id);

  const btn = document.getElementById("saveBtn");

  btn.innerText = "Update Item";

  btn.classList.remove("btn-primary");
  btn.classList.add("btn-success");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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
  btn.classList.add("btn-primary");
}

/* =========================
   EVENTS
========================= */
document.getElementById("survey_id").addEventListener("change", loadItem);

/* =========================
   INIT
========================= */
loadSurvey().then(() => {
  loadItem();
});

/* =========================
   EXPORT
========================= */
window.saveItem = saveItem;
window.editItem = editItem;
window.resetForm = resetForm;
