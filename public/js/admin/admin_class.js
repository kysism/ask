let classes = [];
let editClassId = null;
let saving = false;

const API = "/api/class";
const ORG_API = "/api/org";

// =========================
// INIT (핵심 수정)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  loadOrg();
  loadClass();
}

// =========================
// LOAD ORG
// =========================
async function loadOrg() {
  try {
    const res = await fetch(ORG_API);
    const result = await res.json();

    const data = result.data || [];

    let html = `<option value="">Select Organization</option>`;

    data.forEach((o) => {
      html += `<option value="${o.org_id}">${o.org_nm}</option>`;
    });

    const el = document.getElementById("org_id");
    if (!el) return;

    el.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// =========================
// LOAD CLASS
// =========================
async function loadClass() {
  try {
    const res = await fetch(API);
    const result = await res.json();

    classes = result.data || [];

    render();
  } catch (err) {
    console.error(err);
  }
}

// =========================
// RENDER
// =========================
function render() {
  const body = document.getElementById("classBody");
  if (!body) return;

  let html = "";

  if (!classes.length) {
    html = `
      <tr>
        <td colspan="4" style="text-align:center">No Data</td>
      </tr>
    `;
  }

  classes.forEach((c) => {
    const safeName = JSON.stringify(c.class_nm || "");

    html += `
      <tr>
        <td>${c.class_id}</td>
        <td>${c.tbl_org?.org_nm ?? "-"}</td>
        <td>${c.class_nm}</td>
        <td>
          <button
            class="btn-warning btn-sm"
            onclick='editClass(${c.class_id}, ${safeName}, ${c.org_id})'>
            Edit
          </button>

          <button
            class="btn-danger btn-sm"
            onclick="deleteClass(${c.class_id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  body.innerHTML = html;
}

// =========================
// SAVE (CREATE / UPDATE)
// =========================
async function saveClass() {
  if (saving) return;

  const org_id = document.getElementById("org_id")?.value;
  const class_nm = document.getElementById("class_nm")?.value.trim();

  if (!org_id || !class_nm) {
    alert("Fill all fields");
    return;
  }

  saving = true;

  try {
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

    if (!result.success) throw new Error(result.message);

    resetForm();
    await loadClass();
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    saving = false;
  }
}

// =========================
// EDIT (UPDATE BUTTON FIX)
// =========================
function editClass(id, name, org_id) {
  editClassId = id;

  const nameEl = document.getElementById("class_nm");
  const orgEl = document.getElementById("org_id");
  const btn = document.getElementById("saveBtn");

  if (nameEl) nameEl.value = name || "";
  if (orgEl) orgEl.value = org_id || "";

  if (btn) btn.innerText = "Update Class";
}

// =========================
// DELETE
// =========================
async function deleteClass(id) {
  if (!confirm("Delete?")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    if (editClassId === id) resetForm();

    await loadClass();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// =========================
// RESET
// =========================
function resetForm() {
  editClassId = null;

  const nameEl = document.getElementById("class_nm");
  const btn = document.getElementById("saveBtn");

  if (nameEl) nameEl.value = "";

  if (btn) {
    btn.innerText = "Add Class";
  }
}

// =========================
// WINDOW EXPORT
// =========================
window.saveClass = saveClass;
window.editClass = editClass;
window.deleteClass = deleteClass;
window.resetForm = resetForm;
