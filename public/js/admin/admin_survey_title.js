let editSurveyId = null;

const API = "/api/survey-title";

/* LOAD */
async function loadSurvey() {
  try {
    const res = await fetch(API);
    const result = await res.json();

    const data = result.data || [];

    let table = "";
    let mobile = "";

    data.forEach((row) => {
      const status = row.use_yn
        ? `<span class="status-on">Active</span>`
        : `<span class="status-off">Inactive</span>`;

      table += `
        <tr>
          <td>${row.survey_id}</td>
          <td>${row.survey_title}</td>
          <td>${status}</td>
          <td>
            <button class="btn-warning btn-sm"
              onclick="editSurvey(${row.survey_id}, '${row.survey_title}', ${row.use_yn})">
              Edit
            </button>

            <button class="btn-danger btn-sm"
              onclick="deleteSurvey(${row.survey_id})">
              Delete
            </button>
          </td>
        </tr>
      `;

      mobile += `
        <div class="mobile-item">
          <h3>${row.survey_title}</h3>
          <p>ID: ${row.survey_id}</p>
          <p>${status}</p>

          <button class="btn-warning btn-sm"
            onclick="editSurvey(${row.survey_id}, '${row.survey_title}', ${row.use_yn})">
            Edit
          </button>

          <button class="btn-danger btn-sm"
            onclick="deleteSurvey(${row.survey_id})">
            Delete
          </button>
        </div>
      `;
    });

    document.getElementById("surveyBody").innerHTML = table;
    document.getElementById("mobileSurveyBody").innerHTML = mobile;
  } catch (err) {
    console.error(err);
  }
}

/* SAVE */
async function saveSurvey() {
  const survey_title = document.getElementById("survey_title").value.trim();
  const use_yn = document.getElementById("use_yn").checked;

  if (!survey_title) return alert("Enter title");

  let res;

  if (editSurveyId) {
    res = await fetch(`${API}/${editSurveyId}`, {
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
}

/* EDIT */
function editSurvey(id, title, use_yn) {
  editSurveyId = id;

  document.getElementById("survey_title").value = title;
  document.getElementById("use_yn").checked = use_yn;

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Update Survey";
  btn.classList.add("btn-success");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* DELETE */
async function deleteSurvey(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });

  if (editSurveyId === id) resetForm();

  loadSurvey();
}

/* RESET */
function resetForm() {
  editSurveyId = null;

  document.getElementById("survey_title").value = "";
  document.getElementById("use_yn").checked = true;

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Add Survey";
  btn.classList.remove("btn-success");
}

window.saveSurvey = saveSurvey;
window.editSurvey = editSurvey;
window.deleteSurvey = deleteSurvey;
window.resetForm = resetForm;

loadSurvey();
