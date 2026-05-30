let students = [];
let editStudentId = null;

const API = "/api/student";
const CLASS_API = "/api/class";

// =========================
// LOAD CLASS
// =========================
async function loadClass() {
  const res = await fetch(CLASS_API);
  const result = await res.json();

  let html = `<option value="">Select Class</option>`;

  (result.data || []).forEach((c) => {
    html += `<option value="${c.class_id}">${c.class_nm}</option>`;
  });

  document.getElementById("class_id").innerHTML = html;
}

// =========================
// LOAD STUDENT
// =========================
async function loadStudent() {
  const classId = document.getElementById("class_id").value;

  let url = API;
  if (classId) url += `?class_id=${classId}`;

  const res = await fetch(url);
  const result = await res.json();

  students = result.data || [];
  render();
}

// =========================
// RENDER
// =========================
function render() {
  let html = "";

  students.forEach((s) => {
    html += `
      <tr>
        <td>${s.student_id}</td>
        <td>${s.tbl_class?.class_nm ?? "-"}</td>
        <td>${s.student_nm}</td>
        <td>
          <button class="btn-warning btn-sm"
            onclick="editStudent(${s.student_id}, '${s.student_nm}', ${s.class_id})">
            Edit
          </button>

          <button class="btn-danger btn-sm"
            onclick="deleteStudent(${s.student_id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById("studentBody").innerHTML = html;
}

// =========================
// SAVE
// =========================
async function saveStudent() {
  const class_id = document.getElementById("class_id").value;
  const student_nm = document.getElementById("student_nm").value.trim();

  if (!class_id || !student_nm) return alert("Fill all fields");

  let res;

  if (editStudentId) {
    res = await fetch(`${API}/${editStudentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id, student_nm }),
    });
  } else {
    res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id, student_nm }),
    });
  }

  const result = await res.json();

  if (!result.success) return alert(result.message);

  resetForm();
  loadStudent();
}

// =========================
// EDIT
// =========================
function editStudent(id, name, class_id) {
  editStudentId = id;

  document.getElementById("student_nm").value = name;
  document.getElementById("class_id").value = class_id;
}

// =========================
// DELETE
// =========================
async function deleteStudent(id) {
  if (!confirm("Delete?")) return;

  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  const result = await res.json();

  if (!result.success) return alert(result.message);

  loadStudent();
}

// =========================
// RESET
// =========================
function resetForm() {
  editStudentId = null;
  document.getElementById("student_nm").value = "";
}

// =========================
// EVENTS
// =========================
document.getElementById("class_id").addEventListener("change", loadStudent);

// =========================
// INIT
// =========================
loadClass();
loadStudent();

window.saveStudent = saveStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.resetForm = resetForm;
