let orgs = [];
let editOrgId = null;
let saving = false;

const API = "/api/org";

// =========================
// LOAD
// =========================
async function loadOrgs() {
  try {
    const res = await fetch(API);

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || "Load Failed");
    }

    orgs = result.data || [];

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
    html = `
      <tr>
        <td colspan="4" style="text-align:center">
          No Data
        </td>
      </tr>
    `;
  }

  orgs.forEach((o) => {
    const safeName = JSON.stringify(o.org_nm || "");
    const safePlace = JSON.stringify(o.org_place || "");

    html += `
      <tr>
        <td>${o.org_id}</td>

        <td>${o.org_nm}</td>

        <td>${o.org_place || "-"}</td>

        <td>

          <button
            class="btn-warning btn-sm"
            onclick='editOrg(${o.org_id}, ${safeName}, ${safePlace})'
          >
            Edit
          </button>

          <button
            class="btn-danger btn-sm"
            onclick="deleteOrg(${o.org_id})"
          >
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

  if (!org_nm) {
    alert("Organization Name required");
    return;
  }

  saving = true;

  try {
    let res;

    // UPDATE
    if (editOrgId) {
      res = await fetch(`${API}/${editOrgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_nm,
          org_place,
        }),
      });
    }

    // INSERT
    else {
      res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_nm,
          org_place,
        }),
      });
    }

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    resetForm();

    await loadOrgs();

    alert("Saved");
  } catch (err) {
    console.error(err);
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

  document.getElementById("org_nm").value = name || "";
  document.getElementById("org_place").value = place || "";

  const btn = document.getElementById("saveBtn");

  btn.classList.remove("btn-primary");
  btn.classList.add("btn-success");

  btn.innerText = "Update Organization";
}

// =========================
// DELETE
// =========================
async function deleteOrg(id) {
  if (!confirm("Delete Organization?")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    if (editOrgId === id) {
      resetForm();
    }

    await loadOrgs();

    alert("Deleted");
  } catch (err) {
    console.error(err);
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

  const btn = document.getElementById("saveBtn");

  btn.classList.remove("btn-success");
  btn.classList.add("btn-primary");

  btn.innerText = "Add Organization";
}

// =========================
// MODULE EXPORT TO WINDOW
// =========================
window.saveOrg = saveOrg;
window.editOrg = editOrg;
window.deleteOrg = deleteOrg;
window.resetForm = resetForm;

// INIT
loadOrgs();
