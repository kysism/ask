let classes = [];
let editClassId = null;

const API = "/api/class";
const ORG_API = "/api/org";

// =========================
// LOAD ORG
// =========================
async function loadOrg() {
  const res = await fetch(ORG_API);
  const result = await res.json();

  let html = `<option value="">Select Organization</option>`;

  (result.data || []).forEach((o) => {
    html += `<option value="${o.org_id}">${o.org_nm}</option>`;
  });

  document.getElementById("org_id").innerHTML = html;
}

// =========================
// LOAD CLASS
// =========================
async function loadClass() {
  const res = await fetch(API);
  const result = await res.json();

  classes = result?.data || [];
  render();
}

// =========================
// RENDER
// =========================
function render() {
  const tbody = document.getElementById("classBody");
  if (!tbody) return;

  let html = "";

  classes.forEach((c) => {
    html += `
      <tr>
        <td>${c.class_id}</td>
        <td>${c.tbl_org?.org_nm ?? "-"}</td>
        <td>${c.class_nm}</td>
        <td>
          <button class="btn-warning btn-sm"
            onclick="editClass(${c.class_id}, '${c.class_nm}', ${c.org_id})">
            Edit
          </button>

          <button class="btn-danger btn-sm"
            onclick="deleteClass(${c.class_id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// =========================
// SAVE
// =========================
async function saveClass() {
  const org_id = document.getElementById("org_id").value;
  const class_nm = document.getElementById("class_nm").value.trim();

  if (!org_id || !class_nm) return alert("Fill all fields");

  let res;

  if (editClassId) {
    res = await fetch(`${API}/${editClassId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id, class_nm }),
    });
  } else {
    res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id, class_nm }),
    });
  }

  const result = await res.json();

  if (!result.success) return alert(result.message);

  resetForm();
  loadClass();
}

// =========================
// EDIT
// =========================
function editClass(id, name, org_id) {
  editClassId = id;

  document.getElementById("class_nm").value = name;
  document.getElementById("org_id").value = org_id;
}

// =========================
// DELETE
// =========================
async function deleteClass(id) {
  if (!confirm("Delete?")) return;

  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  const result = await res.json();

  if (!result.success) return alert(result.message);

  loadClass();
}

// =========================
// RESET
// =========================
function resetForm() {
  editClassId = null;
  document.getElementById("class_nm").value = "";
  document.getElementById("org_id").value = "";
}

// =========================
// INIT (SAFE)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadOrg();
  loadClass();
});

window.saveClass = saveClass;
window.editClass = editClass;
window.deleteClass = deleteClass;
window.resetForm = resetForm;
