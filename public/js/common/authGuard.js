(function () {
  const KEY = "koica_survey_admin_pwd";

  function isLoginPage() {
    return location.pathname.includes("login.html");
  }

  function checkAuth() {
    const token = sessionStorage.getItem(KEY);

    // 로그인 페이지는 제외
    if (isLoginPage()) return;

    // 인증 없으면 강제 이동
    if (!token) {
      location.href = "/html/login.html";
    }
  }

  checkAuth();
})();
