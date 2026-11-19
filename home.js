// ====== Carrusel coverflow del inicio (bucle infinito, banner central grande) ======
(function () {
  const track = document.getElementById('hero-track');
  if (!track) return;
  const dotsWrap = document.getElementById('hero-dots');
  const originals = [...track.children];
  const N = originals.length;
  if (!N) return;

  // 3 copias [antes][originales][despuÃ©s] -> siempre hay vecinos y el loop es infinito
  const before = originals.map(s => s.cloneNode(true));
  const after = originals.map(s => s.cloneNode(true));
  track.innerHTML = '';
  [...before, ...originals, ...after].forEach(s => track.appendChild(s));

  let i = N;        // primer original (bloque central)
  let timer = null;

  function render(withTrans) {
    track.style.transition = withTrans ? 'transform .55s cubic-bezier(.4,0,.2,1)' : 'none';
    const els = [...track.children];
    const vp = track.parentElement; // .hero__viewport
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    let left = 0;
    for (let k = 0; k < i; k++) left += els[k].offsetWidth + gap;
    const activeW = els[i].offsetWidth;
    const T = vp.clientWidth / 2 - (left + activeW / 2); // centra el activo
    track.style.transform = 'translateX(' + T + 'px)';
    const logical = ((i % N) + N) % N;
    els.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.classList.toggle('is-prev', k === i - 1);
      s.classList.toggle('is-next', k === i + 1);
    });
    if (dotsWrap) [...dotsWrap.children].forEach((d, k) => d.classList.toggle('is-active', k === logical));
  }

  function go(dir) {
    i += dir;
    render(true);
    // si salimos del bloque central, saltamos (sin transiciÃ³n) al equivalente del medio
    if (i < N || i >= 2 * N) {
      setTimeout(() => { i = N + ((((i - N) % N) + N) % N); render(false); }, 580);
    }
  }
  function auto() { clearInterval(timer); timer = setInterval(() => go(1), 3500); }

  // Puntos (uno por banner real)
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    for (let k = 0; k < N; k++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Ir al banner ' + (k + 1));
      b.addEventListener('click', () => { i = N + k; render(true); auto(); });
      dotsWrap.appendChild(b);
    }
  }

  // render inicial sin transiciÃ³n; recalcula al cargar imÃ¡genes y al redimensionar
  requestAnimationFrame(() => render(false));
  window.addEventListener('load', () => render(false));
  window.addEventListener('resize', () => render(false));
  auto();
})();

// ====== Conteo progresivo de los jackpots (ProgressivePlay) ======
// Cada cifra sube continuamente a su propio ritmo (como los jackpots reales).
(function () {
  // Formato colombiano: $215.530.745 (puntos como separador de miles)
  const fmt = (n) => '$' + Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const PASO = 120; // ms entre actualizaciones

  document.querySelectorAll('.jp-amount').forEach((el) => {
    const rate = parseFloat(el.dataset.rate || '0'); // pesos por segundo
    let val = parseFloat(el.dataset.start || '0');
    if (!rate || !val) return;
    el.textContent = fmt(val);
    setInterval(() => {
      // incremento base del periodo, con pequeÃ±a variaciÃ³n para que "parpadee" natural
      const base = rate * (PASO / 1000);
      val += base * (0.6 + Math.random() * 0.8);
      el.textContent = fmt(val);
    }, PASO);
  });
})();

// ====== Auto-carrusel de los jackpots en celular (slide INFINITO hacia la derecha) ======
// En celular las tarjetas MEGA/SUPER/EXTRA estÃ¡n en una fila deslizable. Para que el
// movimiento sea siempre en una sola direcciÃ³n (sin "devolverse"), cada vez que una
// tarjeta sale por la izquierda la mandamos al final de la fila. Como movemos la MISMA
// tarjeta (no una copia), sus cifras siguen contando en vivo.
(function () {
  const row = document.querySelector('.jackpots__row');
  if (!row) return;
  if (row.children.length < 2) return;

  // Â¿La fila se puede desplazar? (en escritorio son 3 columnas fijas, no se desplaza)
  const scrollable = () => row.scrollWidth - row.clientWidth > 10;

  function go() {
    if (!scrollable()) return;
    const first = row.children[0];
    const gap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 0;
    const dist = first.getBoundingClientRect().width + gap;   // ancho de una tarjeta + separaciÃ³n

    row.scrollTo({ left: dist, behavior: 'smooth' });          // desliza una tarjeta a la derecha
    setTimeout(() => {
      row.appendChild(first);     // la primera tarjeta pasa al final de la fila
      row.scrollLeft = 0;         // reacomoda sin animaciÃ³n -> queda igual, sin salto visible
    }, 700);                      // tras terminar el deslizamiento suave
  }

  setInterval(go, 3000);          // cambia de tarjeta cada 3 segundos
})();