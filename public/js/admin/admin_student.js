import { supabase } from "../../js/common/supabaseClient.js";

let editStudentId = null;

/* =========================
         LOAD CLASS
      ========================= */
async function loadClass() {
  const { data } = await supabase
    .from("tbl_class")
    .select("*")
    .order("class_nm");

  let html = `
          <option value="">
            Select Class | اختر الفصل
          </option>
        `;

  data.forEach((row) => {
    html += `
            <option value="${row.class_id}">
              ${row.class_nm}
            </option>
          `;
  });

  document.getElementById("class_id").innerHTML = html;
}

/* =========================
         LOAD STUDENT
      ========================= */
window.loadStudent = async function () {
  const class_id = document.getElementById("class_id").value;

  let query = supabase
    .from("tbl_student")
    .select(
      `
            student_id,
            student_nm,
            class_id,
            tbl_class(class_nm)
          `,
    )
    .order("student_id", { ascending: false });

  if (class_id) {
    query = query.eq("class_id", class_id);
  }

  const { data } = await query;

  let table = "";
  let mobile = "";

  data.forEach((row) => {
    table += `
            <tr>
              <td>${row.student_id}</td>
              <td>${row.tbl_class?.class_nm ?? "-"}</td>
              <td>${row.student_nm}</td>
              <td>

                <div class="action-buttons">

                  <button
                    class="btn-warning btn-sm"
                    onclick="editStudent(${row.student_id}, '${row.student_nm}', '${row.class_id}')"
                  >
                    Edit | تعديل
                  </button>

                  <button
                    class="btn-danger btn-sm"
                    onclick="deleteStudent(${row.student_id})"
                  >
                    Delete | حذف
                  </button>

                </div>

              </td>
            </tr>
          `;

    mobile += `
            <div class="mobile-item">

              <h3>${row.student_nm}</h3>

              <p><b>ID:</b> ${row.student_id}</p>
              <p><b>Class:</b> ${row.tbl_class?.class_nm ?? "-"}</p>

              <div class="action-buttons">

                <button
                  class="btn-warning btn-sm"
                  onclick="editStudent(${row.student_id}, '${row.student_nm}', '${row.class_id}')"
                >
                  Edit | تعديل
                </button>

                <button
                  class="btn-danger btn-sm"
                  onclick="deleteStudent(${row.student_id})"
                >
                  Delete | حذف
                </button>

              </div>

            </div>
          `;
  });

  document.getElementById("studentBody").innerHTML = table;
  document.getElementById("mobileStudentBody").innerHTML = mobile;
};

/* =========================
         SAVE (INSERT / UPDATE)
      ========================= */
window.saveStudent = async function () {
  const class_id = document.getElementById("class_id").value;
  const student_nm = document.getElementById("student_nm").value.trim();

  if (!class_id) return alert("Select class | اختار الفصل");
  if (!student_nm) return alert("Enter name | اكتب الاسم");

  if (editStudentId) {
    await supabase
      .from("tbl_student")
      .update({ class_id, student_nm })
      .eq("student_id", editStudentId);

    alert("Updated | تم التعديل");
  } else {
    await supabase.from("tbl_student").insert([{ class_id, student_nm }]);

    alert("Inserted | تمت الإضافة");
  }

  resetForm();
  loadStudent();
};

/* =========================
         EDIT
      ========================= */
window.editStudent = function (id, name, class_id) {
  editStudentId = id;

  document.getElementById("student_nm").value = name;
  document.getElementById("class_id").value = class_id;

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Update | تعديل";
  btn.classList.remove("btn-primary");
  btn.classList.add("btn-success");

  window.scrollTo({ top: 0, behavior: "smooth" });
};

/* =========================
         DELETE
      ========================= */
window.deleteStudent = async function (id) {
  if (!confirm("Delete? | حذف؟")) return;

  await supabase.from("tbl_student").delete().eq("student_id", id);

  alert("Deleted | تم الحذف");
  loadStudent();
};

/* =========================
         RESET
      ========================= */
window.resetForm = function () {
  editStudentId = null;

  document.getElementById("student_nm").value = "";

  const btn = document.getElementById("saveBtn");
  btn.innerText = "Add Student | إضافة";
  btn.classList.remove("btn-success");
  btn.classList.add("btn-primary");
};

document.getElementById("class_id").addEventListener("change", loadStudent);

loadClass();
loadStudent();
