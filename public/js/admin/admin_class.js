let classes = [];
let editClassId = null;

const CLASS_API = "/api/class";
const ORG_API = "/api/org";

// =========================
// LOAD ORG
// =========================
async function loadOrg() {
  try {
    const res = await fetch(ORG_API);

    const result = await res.json();

    let html = `
      <option value="">
        Select Organization
      </option>
    `;

    (result.data || []).forEach((row) => {
      html += `
        <option value="${row.org_id}">
          ${row.org_nm}
        </option>
      `;
    });

    document.getElementById("org_id").innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// =========================
// LOAD CLASS
// =========================
async function loadClass() {
  try {
    const orgId = document.getElementById("org_id").value;

    let url = CLASS_API;

    if (orgId) {
      url += `?org_id=${orgId}`;
    }

    const res = await fetch(url);

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
  let tableHtml = "";
  let mobileHtml = "";

  classes.forEach((row) => {
    const classNm = JSON.stringify(row.class_nm || "");
    const orgId = JSON.stringify(row.org_id || "");

    tableHtml += `
      <tr>
        <td>${row.class_id}</td>

        <td>${row.tbl_org?.org_nm ?? "-"}</td>

        <td>${row.class_nm}</td>

        <td>
          <button
            class="btn-warning btn-sm"
            onclick='editClass(
              ${row.class_id},
              ${classNm},
              ${orgId}
            )'
          >
            Edit
          </button>

          <button
            class="btn-danger btn-sm"
            onclick="deleteClass(${row.class_id})"
          >
            Delete
          </button>
        </td>
      </tr>
    `;

    mobileHtml += `
      <div class="mobile-item">

        <h3>${row.class_nm}</h3>

        <p>
          <b>ID :</b> ${row.class_id}
        </p>

        <p>
          <b>Organization :</b>
          ${row.tbl_org?.org_nm ?? "-"}
        </p>

        <div class="action-buttons">

          <button
            class="btn-warning btn-sm"
            onclick='editClass(
              ${row.class_id},
              ${classNm},
              ${orgId}
            )'
          >
            Edit
          </button>

          <button
            class="btn-danger btn-sm"
            onclick="deleteClass(${row.class_id})"
          >
            Delete
          </button>

        </div>

      </div>
    `;
  });

  document.getElementById("classBody").innerHTML = tableHtml;
  document.getElementById("mobileClassBody").innerHTML = mobileHtml;
}

// =========================
// SAVE
// =========================
async function saveClass() {
  const org_id = document.getElementById("org_id").value;
  const class_nm = document.getElementById("class_nm").value.trim();

  if (!org_id) {
    alert("Select Organization");
    return;
  }

  if (!class_nm) {
    alert("Enter Class Name");
    return;
  }

  try {
    let res;

    if (editClassId) {
      res = await fetch(`${CLASS_API}/${editClassId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_id,
          class_nm,
        }),
      });
    } else {
      res = await fetch(CLASS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_id,
          class_nm,
        }),
      });
    }

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    resetForm();
    await loadClass();
  } catch (err) {
    alert(err.message);
  }
}

// =========================
// EDIT
// =========================
function editClass(id, class_nm, org_id) {
  editClassId = id;

  document.getElementById("class_nm").value = class_nm;
  document.getElementById("org_id").value = org_id;

  document.getElementById("saveBtn").innerText = "Update Class";
}

// =========================
// DELETE
// =========================
async function deleteClass(id) {
  if (!confirm("Delete?")) return;

  const res = await fetch(`${CLASS_API}/${id}`, {
    method: "DELETE",
  });

  const result = await res.json();

  if (!result.success) {
    alert(result.message);
    return;
  }

  await loadClass();
}

// =========================
// RESET
// =========================
function resetForm() {
  editClassId = null;

  document.getElementById("class_nm").value = "";

  document.getElementById("saveBtn").innerText = "Add Class | إضافة فصل";
}

// =========================
// EVENT
// =========================
document.getElementById("org_id").addEventListener("change", loadClass);

// =========================
// WINDOW
// =========================
window.saveClass = saveClass;
window.editClass = editClass;
window.deleteClass = deleteClass;
window.resetForm = resetForm;

// =========================
// INIT
// =========================
loadOrg();
loadClass();
