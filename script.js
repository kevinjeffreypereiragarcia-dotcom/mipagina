document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector("button, a, [role='button'], .login-btn");
    const loginContainer = document.querySelector(".login-container, app-header-login-responsive, [class*='login-responsive']");

    if (loginBtn && loginContainer) {
        loginBtn.addEventListener("click", (e) => {
            // Forzar la visualización en dispositivos móviles al hacer clic
            loginContainer.style.display = "block";
            loginContainer.style.visibility = "visible";
            loginContainer.style.opacity = "1";
            loginContainer.style.pointerEvents = "auto";
        });
    }
});