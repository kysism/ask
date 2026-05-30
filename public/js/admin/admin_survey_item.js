import { supabase } from "../../js/common/supabaseClient.js";

let editItemId = null;

/* LOAD SURVEY */
async function loadSurvey() {
  const { data } = await supabase
    .from("tbl_survey")
    .select("*")
    .eq("use_yn", true)
    .order("survey_title");

  let html = `<option value="">Select Survey</option>`;

  data.forEach((row) => {
    html += `<option value="${row.survey_id}">
            ${row.survey_title}
          </option>`;
  });

  document.getElementById("survey_id").innerHTML = html;
}

/* LOAD ITEMS */
window.loadItem = async function () {
  const survey_id = document.getElementById("survey_id").value;

  let query = supabase
    .from("tbl_survey_item")
    .select(
      `
            survey_item_id,
            survey_item,
            survey_id,
            survey_item_type,
            survey_item_mandatory,
            tbl_survey (survey_title)
          `,
    )
    .order("survey_item_id", { ascending: false });

  if (survey_id) query = query.eq("survey_id", survey_id);

  const { data } = await query;

  let tableHtml = "";

  data.forEach((row) => {
    tableHtml += `
            <tr>
              <td>${row.survey_item_id}</td>
              <td>${row.tbl_survey?.survey_title ?? "-"}</td>
              <td>${row.survey_item}</td>
              <td>
                ${
                  row.survey_item_type === "S"
                    ? '<span class="type-badge">Select</span>'
                    : '<span class="type-badge">Input</span>'
                }
              </td>
              <td>
                ${
                  row.survey_item_mandatory
                    ? '<span class="required-badge">Required</span>'
                    : '<span class="optional-badge">Optional</span>'
                }
              </td>

              <td>
                <button class="btn-warning btn-sm edit-btn" data-id="${row.survey_item_id}">
                  Edit
                </button>

                <button class="btn-danger btn-sm delete-btn" data-id="${row.survey_item_id}">
                  Delete
                </button>
              </td>
            </tr>
          `;
  });

  document.getElementById("itemBody").innerHTML = tableHtml;
};

/* EVENT DELEGATION (핵심) */
document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;

  /* EDIT */
  if (e.target.classList.contains("edit-btn")) {
    const { data } = await supabase
      .from("tbl_survey_item")
      .select("*")
      .eq("survey_item_id", id)
      .single();

    editItem(
      data.survey_item_id,
      data.survey_item,
      data.survey_id,
      data.survey_item_type,
      data.survey_item_mandatory,
    );
  }

  /* DELETE */
  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Delete item?")) return;

    await supabase.from("tbl_survey_item").delete().eq("survey_item_id", id);

    loadItem();
  }
});

/* SAVE */
window.saveItem = async function () {
  const survey_id = document.getElementById("survey_id").value;
  const survey_item = document.getElementById("survey_item").value.trim();
  const survey_item_type = document.getElementById("survey_item_type").value;
  const survey_item_mandatory =
    document.getElementById("survey_item_mandatory").value === "true";

  if (!survey_id || !survey_item) return alert("Fill fields");

  if (editItemId) {
    await supabase
      .from("tbl_survey_item")
      .update({
        survey_id,
        survey_item,
        survey_item_type,
        survey_item_mandatory,
      })
      .eq("survey_item_id", editItemId);
  } else {
    await supabase.from("tbl_survey_item").insert([
      {
        survey_id,
        survey_item,
        survey_item_type,
        survey_item_mandatory,
      },
    ]);
  }

  resetForm();
  loadItem();
};

/* EDIT */
window.editItem = function (id, item, survey_id, type, mandatory) {
  editItemId = id;

  document.getElementById("survey_item").value = item;
  document.getElementById("survey_id").value = survey_id;
  document.getElementById("survey_item_type").value = type;
  document.getElementById("survey_item_mandatory").value = String(mandatory);

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Update Item";
  btn.classList.add("btn-success");

  window.scrollTo({ top: 0, behavior: "smooth" });
};

/* RESET */
window.resetForm = function () {
  editItemId = null;

  document.getElementById("survey_item").value = "";
  document.getElementById("survey_item_type").value = "S";
  document.getElementById("survey_item_mandatory").value = "true";

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Add Item";
  btn.classList.remove("btn-success");
};

document.getElementById("survey_id").addEventListener("change", loadItem);

loadSurvey();
loadItem();
