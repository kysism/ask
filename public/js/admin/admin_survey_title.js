import { supabase } from "../../js/common/supabaseClient.js";

let editSurveyId = null;

/* =========================================
         LOAD SURVEY
      ========================================= */
window.loadSurvey = async function () {
  const { data, error } = await supabase
    .from("tbl_survey")
    .select("*")
    .order("survey_id", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return;
  }

  let table = "";
  let mobile = "";

  data.forEach((row) => {
    const statusBadge = row.use_yn
      ? `<span class="status-on">Active | مفعل</span>`
      : `<span class="status-off">Inactive | غير مفعل</span>`;

    table += `
            <tr>

              <td>
                ${row.survey_id}
              </td>

              <td>
                ${row.survey_title}
              </td>

              <td>
                ${statusBadge}
              </td>

              <td>

                <div class="action-buttons">

                  <button
                    class="btn-warning btn-sm"
                    onclick="editSurvey(
                      ${row.survey_id},
                      \`${row.survey_title}\`,
                      ${row.use_yn}
                    )"
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

              <h3>
                ${row.survey_title}
              </h3>

              <p>
                <strong>ID :</strong>
                ${row.survey_id}
              </p>

              <p>
                <strong>Status :</strong>
                ${statusBadge}
              </p>

              <div class="action-buttons">

                <button
                  class="btn-warning btn-sm"
                  onclick="editSurvey(
                    ${row.survey_id},
                    \`${row.survey_title}\`,
                    ${row.use_yn}
                  )"
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
};

/* =========================================
         SAVE
      ========================================= */
window.saveSurvey = async function () {
  const survey_title = document.getElementById("survey_title").value.trim();

  const use_yn = document.getElementById("use_yn").checked;

  if (!survey_title) {
    alert("Enter title | اكتب العنوان");
    return;
  }

  /* UPDATE */
  if (editSurveyId) {
    const { error } = await supabase
      .from("tbl_survey")
      .update({
        survey_title,
        use_yn,
      })
      .eq("survey_id", editSurveyId);

    if (error) {
      console.error(error);
      alert("Update failed | فشل التعديل");
      return;
    }

    alert("Updated successfully | تم التعديل");
  } else {
    /* INSERT */
    const { error } = await supabase.from("tbl_survey").insert([
      {
        survey_title,
        use_yn,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Insert failed | فشل الإضافة");
      return;
    }

    alert("Added successfully | تمت الإضافة");
  }

  resetForm();
  loadSurvey();
};

/* =========================================
         EDIT
      ========================================= */
window.editSurvey = function (id, title, use_yn) {
  editSurveyId = id;

  document.getElementById("survey_title").value = title;

  document.getElementById("use_yn").checked = use_yn;

  const btn = document.getElementById("saveBtn");

  btn.innerText = "Update Survey | تعديل الاستبيان";

  btn.classList.remove("btn-primary");

  btn.classList.add("btn-success");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/* =========================================
         DELETE
      ========================================= */
window.deleteSurvey = async function (id) {
  const ok = confirm("Delete survey? | حذف الاستبيان؟");

  if (!ok) return;

  const { error } = await supabase
    .from("tbl_survey")
    .delete()
    .eq("survey_id", id);

  if (error) {
    console.error(error);
    alert("Delete failed | فشل الحذف");
    return;
  }

  alert("Deleted successfully | تم الحذف");

  loadSurvey();
};

/* =========================================
         RESET
      ========================================= */
window.resetForm = function () {
  editSurveyId = null;

  document.getElementById("survey_title").value = "";

  document.getElementById("use_yn").checked = true;

  const btn = document.getElementById("saveBtn");

  btn.innerText = "Add Survey | إضافة استبيان";

  btn.classList.remove("btn-success");

  btn.classList.add("btn-primary");
};

/* =========================================
         INIT
      ========================================= */
loadSurvey();
