let orgs = [];
let editOrgId = null;
let saving = false;

const API = "/api/org";

// =========================
// ESCAPE
// =========================
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================
// LOAD
// =========================
async function loadOrgs() {
  try {
    const res = await fetch(API);

    const result = await res.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid API response");
    }

    orgs = result.data;
    render();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// =========================
// RENDER
// =========================
function render() {
  let html = "";

  if (orgs.length === 0) {
    html = `<tr><td colspan="4">No Data</td></tr>`;
  }

  orgs.forEach((o) => {
    html += `
      <tr>
        <td>${o.org_id}</td>
        <td>${escapeHtml(o.org_nm)}</td>
        <td>${escapeHtml(o.org_place || "-")}</td>
        <td>
          <button class="btn-warning btn-sm"
            onclick="editOrg(${o.org_id}, '${escapeHtml(o.org_nm)}', '${escapeHtml(o.org_place || "")}')">
            Edit
          </button>

          <button class="btn-danger btn-sm"
            onclick="deleteOrg(${o.org_id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById("orgBody").innerHTML = html;
}

// =========================
// SAVE
// =========================
async function saveOrg() {
  if (saving) return;

  const org_nm = document.getElementById("org_nm").value.trim();
  const org_place = document.getElementById("org_place").value.trim();

  if (!org_nm) return alert("Enter name");

  saving = true;

  try {
    let res;

    if (editOrgId) {
      res = await fetch(`${API}/${editOrgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_nm, org_place }),
      });
    } else {
      res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_nm, org_place }),
      });
    }

    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    resetForm();
    await loadOrgs();
  } catch (err) {
    alert(err.message);
  } finally {
    saving = false;
  }
}

// =========================
// EDIT
// =========================
function editOrg(id, name, place) {
  editOrgId = id;

  document.getElementById("org_nm").value = name;
  document.getElementById("org_place").value = place || "";
}

// =========================
// DELETE
// =========================
async function deleteOrg(id) {
  if (!confirm("Delete?")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    await loadOrgs();

    if (editOrgId === id) resetForm();
  } catch (err) {
    alert(err.message);
  }
}

// =========================
// RESET
// =========================
function resetForm() {
  editOrgId = null;
  document.getElementById("org_nm").value = "";
  document.getElementById("org_place").value = "";
}

// =========================
// IMPORTANT: MODULE FIX
// =========================
window.editOrg = editOrg;
window.deleteOrg = deleteOrg;
window.saveOrg = saveOrg;

loadOrgs();
