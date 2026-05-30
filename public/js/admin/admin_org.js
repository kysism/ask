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

    console.log("status:", res.status);

    const text = await res.text();
    console.log("raw response:", text);

    const result = JSON.parse(text);

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
