(function () {
  const KEY = "admin_token";

  function isLoginPage() {
    return location.pathname.includes("login.html");
  }

  function hasValidSession() {
    const token = localStorage.getItem(KEY);

    return !!token;
  }

  function redirectToLogin() {
    location.replace("/html/login.html");
  }

  function initAuthGuard() {
    if (isLoginPage()) return;

    if (!hasValidSession()) {
      redirectToLogin();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthGuard);
  } else {
    initAuthGuard();
  }
})();
