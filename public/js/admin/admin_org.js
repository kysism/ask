let editOrgId = null;

const API = "/api/org";

let orgs = [];

let saving = false;

// =========================
// ESCAPE HTML
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

    if (!res.ok) {
      const text = await res.text();
      console.log("status:", res.status);
      console.log("raw response:", text);
      throw new Error("API Load Failed");
    }

    const result = await res.json();

    if (!Array.isArray(result.data)) {
      throw new Error("Invalid data format");
    }

    orgs = result.data;

    render();
  } catch (err) {
    console.error(err);
    alert(err.message || "Load Error");
  }
}

// =========================
// RENDER
// =========================
function render() {
  let table = "";
  let mobile = "";

  if (orgs.length === 0) {
    table = `
      <tr>
        <td colspan="3" style="text-align:center;">No Data</td>
      </tr>
    `;

    document.getElementById("orgBody").innerHTML = table;
    document.getElementById("mobileOrgBody").innerHTML = `
      <div class="mobile-item">No Data</div>
    `;
    return;
  }

  orgs.forEach((row) => {
    const id = row.org_id;
    const name = escapeHtml(row.org_nm);
    const place = escapeHtml(row.org_place || "-");

    table += `
      <tr>
        <td>${id}</td>
        <td>${name}</td>
        <td>${place}</td>
        <td>
          <button class="btn-warning btn-sm"
            onclick="editOrg(${id}, '${name}', '${place}')">
            Edit | تعديل
          </button>

          <button class="btn-danger btn-sm"
            onclick="deleteOrg(${id})">
            Delete | حذف
          </button>
        </td>
      </tr>
    `;

    mobile += `
      <div class="mobile-item">
        <h3>${name}</h3>
        <p><b>ID:</b> ${id}</p>
        <p><b>Location:</b> ${place}</p>

        <button class="btn-warning btn-sm"
          onclick="editOrg(${id}, '${name}', '${place}')">
          Edit
        </button>

        <button class="btn-danger btn-sm"
          onclick="deleteOrg(${id})">
          Delete
        </button>
      </div>
    `;
  });

  document.getElementById("orgBody").innerHTML = table;
  document.getElementById("mobileOrgBody").innerHTML = mobile;
}

// =========================
// SAVE (CREATE / UPDATE)
// =========================
async function saveOrg() {
  if (saving) return;

  const org_nm = document.getElementById("org_nm").value.trim();
  const org_place = document.getElementById("org_place").value.trim();

  if (!org_nm) {
    return alert("Enter organization name");
  }

  saving = true;

  try {
    let response;

    // UPDATE
    if (editOrgId) {
      response = await fetch(`${API}/${editOrgId}`, {
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
    // CREATE
    else {
      response = await fetch(API, {
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

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Save failed");
    }

    alert("Saved successfully");

    resetForm();
    await loadOrgs();
  } catch (err) {
    console.error(err);
    alert(err.message || "Save Error");
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
  document.getElementById("org_place").value = place;
}

// =========================
// DELETE
// =========================
async function deleteOrg(id) {
  if (!confirm("Delete this organization?")) return;

  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Delete failed");
    }

    alert("Deleted successfully");

    await loadOrgs();

    if (editOrgId === id) {
      resetForm();
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Delete Error");
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
  btn.innerText = "Add Organization | إضافة";
  btn.classList.remove("btn-success");
  btn.classList.add("btn-primary");
}

// INIT
loadOrgs();
