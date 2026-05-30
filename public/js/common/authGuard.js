(function () {
  const KEY = "koica_survey_admin_pwd";

  function isLoginPage() {
    return location.pathname.includes("login.html");
  }

  function isPublicPage() {
    return (
      location.pathname.includes("/client/") ||
      location.pathname.includes("survey_view.html")
    );
  }

  function checkAuth() {
    try {
      // 로그인 페이지는 무조건 제외
      if (isLoginPage()) return;

      // 공개 페이지도 제외 (설문 응답 등)
      if (isPublicPage()) return;

      const token = sessionStorage.getItem(KEY);

      if (!token) {
        // redirect loop 방지
        if (!location.pathname.includes("login.html")) {
          location.replace("/html/login.html");
        }
      }
    } catch (err) {
      console.error("authGuard error:", err);
    }
  }

  checkAuth();
})();
