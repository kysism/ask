(function () {
  const KEY = "koica_survey_admin_pwd";

  function isLoginPage() {
    return location.pathname.includes("login.html");
  }

  function hasValidSession() {
    const token = sessionStorage.getItem(KEY);
    return token && token.length > 0;
  }

  function redirectToLogin() {
    if (!location.pathname.includes("/html/login.html")) {
      location.href = "/html/login.html";
    }
  }

  function initAuthGuard() {
    // login 페이지는 검사 제외
    if (isLoginPage()) return;

    // 세션 없으면 즉시 이동
    if (!hasValidSession()) {
      redirectToLogin();
    }
  }

  // DOM 로딩 후 실행 (튕김 방지 핵심)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthGuard);
  } else {
    initAuthGuard();
  }
})();
