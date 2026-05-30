let editSurveyId = null;

const API = "/api/survey";

// =========================
// LOAD
// =========================
async function loadSurvey() {
  try {
    const res = await fetch(API);
    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    const data = result.data || [];

    let table = "";
    let mobile = "";

    data.forEach((row) => {
      const status = row.use_yn
        ? `<span class="status-on">Active | مفعل</span>`
        : `<span class="status-off">Inactive | غير مفعل</span>`;

      const title = JSON.stringify(row.survey_title || "");

      table += `
        <tr>
          <td>${row.survey_id}</td>
          <td>${row.survey_title}</td>
          <td>${status}</td>
          <td>
            <div class="action-buttons">

              <button
                class="btn-warning btn-sm"
                onclick="editSurvey(${row.survey_id}, ${title}, ${row.use_yn})"
              >
                Edit | تعديل
              </button>

              <button
                class="btn-danger btn-sm"
                onclick="deleteSurvey(${row.survey_id})"
              >
                Delete | حذف
              </button>

            </div>
          </td>
        </tr>
      `;

      mobile += `
        <div class="mobile-item">
          <h3>${row.survey_title}</h3>

          <p><strong>ID :</strong> ${row.survey_id}</p>

          <p><strong>Status :</strong> ${status}</p>

          <div class="action-buttons">

            <button
              class="btn-warning btn-sm"
              onclick="editSurvey(${row.survey_id}, ${title}, ${row.use_yn})"
            >
              Edit | تعديل
            </button>

            <button
              class="btn-danger btn-sm"
              onclick="deleteSurvey(${row.survey_id})"
            >
              Delete | حذف
            </button>

          </div>
        </div>
      `;
    });

    document.getElementById("surveyBody").innerHTML = table;
    document.getElementById("mobileSurveyBody").innerHTML = mobile;
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// =========================
// SAVE (CREATE / UPDATE)
// =========================
async function saveSurvey() {
  const survey_title = document.getElementById("survey_title").value.trim();

  const use_yn = document.getElementById("use_yn").checked;

  if (!survey_title) {
    alert("Enter title | اكتب العنوان");
    return;
  }

  try {
    let res;

    if (editSurveyId) {
      res = await fetch(`${API}/${editSurveyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_title,
          use_yn,
        }),
      });
    } else {
      res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_title,
          use_yn,
        }),
      });
    }

    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    resetForm();
    await loadSurvey();

    alert(editSurveyId ? "Updated" : "Added");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// =========================
// EDIT
// =========================
function editSurvey(id, title, use_yn) {
  editSurveyId = id;

  document.getElementById("survey_title").value = title;
  document.getElementById("use_yn").checked = use_yn;

  const btn = document.getElementById("saveBtn");

  btn.innerText = "Update Survey | تعديل الاستبيان";
  btn.classList.remove("btn-primary");
  btn.classList.add("btn-success");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =========================
// DELETE
// =========================
async function deleteSurvey(id) {
  if (!confirm("Delete survey? | حذف الاستبيان؟")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    // ⭐ 삭제 후 현재 편집중이면 초기화
    if (editSurveyId === id) resetForm();

    await loadSurvey();

    alert("Deleted");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// =========================
// RESET (핵심)
// =========================
function resetForm() {
  editSurveyId = null;

  document.getElementById("survey_title").value = "";
  document.getElementById("use_yn").checked = true;

  const btn = document.getElementById("saveBtn");

  btn.innerText = "Add Survey | إضافة استبيان";
  btn.classList.remove("btn-success");
  btn.classList.add("btn-primary");
}

// =========================
// EXPORT
// =========================
window.saveSurvey = saveSurvey;
window.editSurvey = editSurvey;
window.deleteSurvey = deleteSurvey;
window.resetForm = resetForm;

// =========================
// INIT
// =========================
loadSurvey();
