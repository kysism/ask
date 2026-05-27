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
      throw new Error("API Load Failed");
    }

    const result = await res.json();

    orgs = result.data || [];

    console.log(orgs);

    //render();
  } catch (err) {
    console.error(err);

    alert(err.message || "Load Error");
  }
}

loadOrgs();
