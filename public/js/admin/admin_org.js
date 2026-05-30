let editOrgId = null;

const API = "/api/org";

let orgs = [];

let editCode = null;

let saving = false;

// =========================
// ESCAPE HTML
// =========================
function escapeHtml(str = "") {
  return str
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
      console.log("status:", res.status);
      const text = await res.text();
      console.log("raw response:", text);

      throw new Error("API Load Failed");
    }

    const result = await res.json();

    orgs = result.data || [];

    console.log(orgs);

    render();
  } catch (err) {
    console.error(err);

    alert(err.message || "Load Error");
  }
}

// =========================
// render
// =========================
function render() {
  let table = "";
  let mobile = "";

  data.forEach((row) => {
    table += `
            <tr>
              <td>${row.org_id}</td>
              <td>${row.org_nm}</td>
              <td>${row.org_place ?? "-"}</td>

              <td>

                <div class="action-buttons">

                  <button
                    class="btn-warning btn-sm"
                    onclick="editOrg(${row.org_id}, '${row.org_nm}', '${row.org_place}')"
                  >
                    Edit | تعديل
                  </button>

                  <button
                    class="btn-danger btn-sm"
                    onclick="deleteOrg(${row.org_id})"
                  >
                    Delete | حذف
                  </button>

                </div>

              </td>
            </tr>
          `;

    mobile += `
            <div class="mobile-item">

              <h3>${row.org_nm}</h3>

              <p><b>ID:</b> ${row.org_id}</p>
              <p><b>Location:</b> ${row.org_place ?? "-"}</p>

              <div class="action-buttons">

                <button
                  class="btn-warning btn-sm"
                  onclick="editOrg(${row.org_id}, '${row.org_nm}', '${row.org_place}')"
                >
                  Edit | تعديل
                </button>

                <button
                  class="btn-danger btn-sm"
                  onclick="deleteOrg(${row.org_id})"
                >
                  Delete | حذف
                </button>

              </div>

            </div>
          `;
  });

  document.getElementById("orgBody").innerHTML = table;
  document.getElementById("mobileOrgBody").innerHTML = mobile;
}

loadOrgs();
