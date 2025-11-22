
// Theme toggle with localStorage persistence
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      root.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
  });
})();

// WhatsApp deep link
const WHATSAPP = 'https://wa.me/525534806184?text=Hola%20Erick%20—%20quiero%20asesor%C3%ADa%20fiscal';
document.querySelectorAll('[data-whatsapp]').forEach(el => {
  el.href = WHATSAPP;
  el.rel = 'noopener';
});

// IntersectionObserver for reveal animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Contact form fallback
const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const need = form.need.value;
    const message = form.message.value.trim();
    if (!name || !email) {
      alert('Por favor completa tu nombre y correo.');
      return;
    }
    const subject = encodeURIComponent('Contacto EVORIX');
    const body = encodeURIComponent(`Nombre: ${name}
Email: ${email}
Necesidad: ${need}
Mensaje: ${message}`);
    window.location.href = `mailto:cperickd@gmail.com?subject=${subject}&body=${body}`;
  });
}

// Header flotante: ocultar al bajar, mostrar al subir, y compactar con scroll
(function(){
  const header = document.querySelector('header.site');
  if (!header) { console.warn('[EVORIX] No encontré header.site'); return; }

  // Marca el body para aplicar padding-top
  document.body.classList.add('has-fixed-header');

  let lastY = window.pageYOffset || 0;
  let ticking = false;

  function onScroll(){
    const y = window.pageYOffset || 0;

    // Oculta al bajar (solo si ya pasaste 80px); muestra al subir
    if (y > 80 && y > lastY){
      header.classList.add('hide');
    } else {
      header.classList.remove('hide');
    }

    // Compacta cuando ya bajaste un poco
    if (y > 140){
      header.classList.add('compact');
    } else {
      header.classList.remove('compact');
    }

    lastY = y;
    ticking = false;
  }

  // Dispara una vez al cargar por si entras a mitad de página
  onScroll();

  window.addEventListener('scroll', function(){
    if (!ticking){
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  console.log('[EVORIX] Header flotante activo');
})();






// ===== Casos: activar uno a uno, contador KPI, mini-gráfica y "Cómo se logró" =====
(function(){
  const section = document.querySelector('#casos');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.card'));
  if (!cards.length) return;

  // 1) Preparar KPI: localizar número y convertirlo a <span class="num" data-target="...">
  cards.forEach((card, idx) => {



    // === NUEVO: animar número por tiempo y forzar aparición en cascada ===

// helper mínimo para contar 0 -> target (respeta motion reducido)
function animarNumero(el, target, dur = 900) {
  const prefiereReducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefiereReducir) { el.textContent = String(target); return; }
  const inicio = performance.now();
  const desde = 0;
  function tick(t) {
    const p = Math.min(1, (t - inicio) / dur);
    const val = Math.round(desde + (target - desde) * (1 - Math.pow(1 - p, 3))); // easeOutCubic
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// activar tarjetas por tiempo (fallback: siempre aparecen)
cards.forEach((card, i) => {
  setTimeout(() => {
    card.classList.add('is-visible'); // tu CSS/IO ya entiende esta clase

    const num = card.querySelector('.num');
    const to = num ? parseInt(num.getAttribute('data-target') || '', 10) : NaN;
    if (!isNaN(to)) animarNumero(num, to, 900);

    // si ya tienes otro dibujado de sparkline, NO tocamos nada aquí
    // (solo aseguramos que el canvas exista arriba)
  }, 200 + i * 220); // 200ms, luego 420ms, 640ms…
});

    const kpi = card.querySelector('.kpi');
    if (!kpi) return;

    // Buscar número hasta el símbolo % (puede ser + o -)
    const text = kpi.textContent.trim();
    const match = text.match(/([+-]?\d+)\s*%/);
    if (!match) return;

    const value = parseInt(match[1], 10);          // ej. -18
    // Limpiar kpi y reconstruir
    const small = kpi.querySelector('small');
    const smallHTML = small ? small.outerHTML : '';

    kpi.innerHTML = `
      <span class="num" data-target="${value}">0</span>% ${smallHTML}
    `;

    // 2) Agregar un canvas para sparkline
    
    const spark = document.createElement('canvas');
    spark.className = 'spark';
    card.appendChild(spark);
  });




  


  // 3) Data de ejemplo para sparkline y "cómo se logró"
  //    Puedes editar estos arrays luego con tus datos reales.
  const HOW = [
    [
      'Diagnóstico de inconsistencias y aclaraciones ante SAT.',
      'Proyección anual por escenarios y regularización.',
      'Ajustes de deducibles y calendario mensual.'
    ],
    [
      'Macros/Power Query para conciliaciones bancarias.',
      'Validadores masivos CFDI y reglas de póliza.',
      'Reporte operativo con alertas de corte.'
    ],
    [
      'Dashboard de ventas/impuestos con segmentación.',
      'Alertas de vencimientos y flujo proyectado.',
      'Revisión de pricing y costos transaccionales.'
    ]
  ];
 
  const SPARK = [
    // -40% carga fiscal anual (100 → 60)
    [100, 97, 93, 88, 82, 75, 67, 60],
  
    // -20% tiempo operativo (100 → 80) con caída un poco más marcada al final
    [100, 99, 98, 96, 92, 87, 83, 80],
  
    // +70% velocidad en decisiones. Normalizado (≈59 → 100) para representar 170 sobre base 100
    [55, 60, 68, 77, 85, 92, 98, 100],
  ];
  



  // 4) Dibujo de sparkline muy ligero (Canvas 2D)
  function drawSpark(canvas, points, color) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...points), max = Math.max(...points);
    const pad = 6;
    const sx = (i) => pad + (w - pad*2) * (i /(points.length-1));
    const sy = (v) => h - pad - (h - pad*2) * ((v - min)/(max - min || 1));

    // área suave
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(sx(i), sy(p)) : ctx.moveTo(sx(i), sy(p)));
    ctx.lineTo(w-pad, h-pad); ctx.lineTo(pad, h-pad); ctx.closePath();
    ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ', .12)');
    ctx.fill();

    // línea
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(sx(i), sy(p)) : ctx.moveTo(sx(i), sy(p)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 5) Contador suave del KPI
  function countTo(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const start = 0;
    const dur = 3900; // ms
    const t0 = performance.now();

    function tick(t){
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.round(start + (target - start) * eased);
      el.textContent = val.toString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // 6) “Cómo se logró”: inyectar details en la activación
  function ensureHow(card, idx){
    if (card.querySelector('details.how')) return;
    const details = document.createElement('details');
    details.className = 'how';
    const items = (HOW[idx] || []).map(li => `<li>${li}</li>`).join('');
    details.innerHTML = `
      <summary>Cómo se logró</summary>
      <ul style="margin:8px 0 0 18px">${items}</ul>
    `;
    card.appendChild(details);
  }

  // 7) Observer: activa de a una, cuenta KPI y dibuja spark
  const colorPrimary = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary').trim() || 'rgb(0,76,255)';

  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    // elegir la más visible
    let best = null;
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
    });
    if (!best) return;

    // quitar "active" del resto, activar la mejor
    cards.forEach(c => c.classList.remove('active'));
    const card = best.target;
    card.classList.add('active', 'just-activated');
    setTimeout(() => card.classList.remove('just-activated'), 400);



      // KPI + spark + how (una sola vez) PARA CADA TARJETA QUE ENTRE EN PANTALLA
  entries.forEach(e => {
    if (!e.isIntersecting) return;

    const card = e.target;
    if (seen.has(card)) return;

    const numEl = card.querySelector('.kpi .num');
    if (numEl) countTo(numEl);

    const spark = card.querySelector('canvas.spark');
    const idx = cards.indexOf(card);
    if (spark && SPARK[idx]) {
      drawSpark(spark, SPARK[idx], colorPrimary);
    }

    ensureHow(card, idx);
    seen.add(card);
  });






    // KPI + spark + how (una sola vez)
    //if (!seen.has(card)) {
    //  const numEl = card.querySelector('.kpi .num');
    //  if (numEl) countTo(numEl);

    //  const spark = card.querySelector('canvas.spark');
    //  const idx = cards.indexOf(card);
    //  if (spark && SPARK[idx]) drawSpark(spark, SPARK[idx], colorPrimary);

    //  ensureHow(card, idx);
    //  seen.add(card);
    //}





  }, { root: null, threshold: [0.25, 0.5, 0.75] });

  cards.forEach(c => io.observe(c));
})();


// ===== PROCESO: guía por scroll con foco, barra de progreso y texto "escribiéndose" =====
(function(){
  const wrap = document.querySelector('#proceso .container');
  const steps = Array.from(document.querySelectorAll('#proceso .step'));
  if (!wrap || !steps.length) return;

  // A) Asegurar la barra de progreso (si no existe en el HTML)
  let progress = wrap.querySelector('.progress');
  if (!progress){
    progress = document.createElement('div');
    progress.className = 'progress';
    progress.innerHTML = '<div class="bar"></div>';
    wrap.insertBefore(progress, wrap.querySelector('.steps'));
  }
  const bar = progress.querySelector('.bar');

  // B) Guardar textos y limpiar para "typewriter" suave
  steps.forEach(step => {
    const p = step.querySelector('p');
    if (!p) return;
    p.dataset.full = p.textContent.trim();
    p.textContent = ''; // se escribirá cuando toque
  });

  // C) Escribir con calma (sin cursilerías)
  function typeIn(el, text, speed = 13){
    // si ya estaba escrito, no repetir
    if (el.dataset.written === '1') return;
    let i = 0;
    function tick(){
      el.textContent = text.slice(0, i++);
      if (i <= text.length) {
        // micro pausas donde hay coma o punto
        const ch = text[i-1];
        const extra = (ch === ',' ? 120 : ch === '.' ? 160 : 0);
        setTimeout(tick, speed + extra);
      } else {
        el.dataset.written = '1';
      }
    }
    tick();
  }

  // D) Observer: activa de a una, escribe y actualiza progreso
  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    // Elegir el paso más visible
    let best = null;
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
    });
    if (!best) return;

    steps.forEach(s => s.classList.remove('active'));
    const step = best.target;
    step.classList.add('active','just-activated');
    setTimeout(()=> step.classList.remove('just-activated'), 400);

    // Escribir el párrafo solo una vez
    const p = step.querySelector('p');
    if (p && p.dataset.full && !seen.has(step)){
      typeIn(p, p.dataset.full);
      seen.add(step);
    }

    // Barra de progreso
    const idx = steps.indexOf(step);
    const pct = Math.round(((idx+1)/steps.length) * 100);
    bar.style.width = pct + '%';

    // Accesibilidad: marca aria-current
    steps.forEach(s => s.removeAttribute('aria-current'));
    step.setAttribute('aria-current','step');
  }, { threshold: [0.25, 0.6, 0.9] });

  steps.forEach(s => io.observe(s));

  // E) También activar al hacer click (por si el usuario “toca” un paso)
  steps.forEach((s, idx) => {
    s.style.cursor = 'pointer';
    s.addEventListener('click', () => {
      s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // dispara manualmente el tipeo si aún no pasó por el observer
      const p = s.querySelector('p');
      if (p && p.dataset.full) typeIn(p, p.dataset.full);
      const pct = Math.round(((idx+1)/steps.length) * 100);
      bar.style.width = pct + '%';
      steps.forEach(x => x.classList.remove('active'));
      s.classList.add('active');
    });
  });

  // F) Arranque
  // si cargas ya posicionado, forzar un primer cálculo
  window.requestAnimationFrame(()=> {
    window.dispatchEvent(new Event('scroll'));
  });
})();




/* ===== Servicios (scrollytelling) ===== */
(function () {
  const scroller = document.querySelector('.svc-scroller');
  if (!scroller) return;

  const sticky = scroller.querySelector('.svc-sticky');
  const slides = [...sticky.querySelectorAll('.svc-slide')];
  const dots   = [...sticky.querySelectorAll('.svc-dots b')];
  const steps  = slides.length;

  // Refuerza que la altura del scroller refleje el # de slides
  scroller.style.setProperty('--steps', String(steps));

  // Utils
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const once  = (el, key) => {
    if (!el.__done) el.__done = {};
    if (el.__done[key]) return false;
    el.__done[key] = true;
    return true;
  };

  /* ---------- Animaciones por slide ---------- */
  function animSAT(slide) {
    // Trazo “tubería”
    const path = slide.querySelector('.pipe path');
    if (path) {
      // asegúrate que parta oculto
      const dash = path.getTotalLength ? path.getTotalLength() : 420;
      path.style.strokeDasharray = dash;
      path.style.strokeDashoffset = dash;
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 1.1s ease .15s';
        path.style.strokeDashoffset = '0';
      });
    }
    // Checklist escalonado
    const rows = [...slide.querySelectorAll('.row')];
    rows.forEach((r, i) => setTimeout(() => r.classList.add('done'), 240 + i * 220));
    // Badge
    const badge = slide.querySelector('.badge');
    if (badge) {
      requestAnimationFrame(() => {
        badge.style.transition = 'opacity .45s ease .8s, transform .45s ease .8s';
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0)';
      });
    }
  }

  function animContab(slide) {
    // KPIs con contador
    slide.querySelectorAll('.kpi-num').forEach(span => {
      const target = parseInt(span.dataset.count || '0', 10);
      if (!target || !once(span, 'count')) return;
      const dur = 900;
      const t0 = performance.now();
      (function tick(t){
        const p = clamp((t - t0) / dur, 0, 1);
        span.textContent = String(Math.round(target * p));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });

    // Sparkline
    const spark = slide.querySelector('.spark polyline');
    if (spark) {
      const dash = 600;
      spark.style.strokeDasharray = dash;
      spark.style.strokeDashoffset = dash;
      requestAnimationFrame(() => {
        spark.style.transition = 'stroke-dashoffset 1.1s ease';
        spark.style.strokeDashoffset = '0';
      });
    }

    // Barras (una a una)
    const bars = [...slide.querySelectorAll('.bars i')];
    bars.forEach((b, i) => {
      b.classList.remove('on');
      setTimeout(() => b.classList.add('on'), 140 * i + 140);
    });
  }

  function animTools(slide) {
    // Chips / badges
    const chips = [...slide.querySelectorAll('.tool-badges .tool')];
    chips.forEach((c, i) => setTimeout(() => c.classList.add('on'), 120 * i + 90));

    // Red (líneas)
    const lines = [...slide.querySelectorAll('.net .links line')];
    lines.forEach((ln, i) => {
      const len = 260;
      ln.style.strokeDasharray = len;
      ln.style.strokeDashoffset = len;
      requestAnimationFrame(() => {
        ln.style.transition = `stroke-dashoffset .9s ease ${i * 0.15}s`;
        ln.style.strokeDashoffset = '0';
      });
    });

    // Pseudocódigo (desplegar)
    const code = slide.querySelector('.code');
    if (code) {
      requestAnimationFrame(() => {
        code.style.transition = 'max-height .6s ease, opacity .6s ease';
        code.style.maxHeight = '220px';
        code.style.opacity = '1';
      });
    }
  }

  const animByIndex = [animSAT, animContab, animTools];

  /* ---------- Estado inicial limpio (antes de animar) ---------- */
  function primeInitial() {
    slides.forEach(slide => {
      // reset stroke elements
      const p = slide.querySelector('.pipe path');
      if (p) {
        const dash = p.getTotalLength ? p.getTotalLength() : 420;
        p.style.strokeDasharray = dash;
        p.style.strokeDashoffset = dash;
      }
      const spark = slide.querySelector('.spark polyline');
      if (spark) {
        const dash = 600;
        spark.style.strokeDasharray = dash;
        spark.style.strokeDashoffset = dash;
      }
      slide.querySelectorAll('.bars i').forEach(b => b.classList.remove('on'));
      const code = slide.querySelector('.code');
      if (code) { code.style.maxHeight = '0px'; code.style.opacity = '0'; }
      const badge = slide.querySelector('.badge');
      if (badge) { badge.style.opacity = '0'; badge.style.transform = 'translateY(6px)'; }
      const rows = slide.querySelectorAll('.row');
      rows.forEach(r => r.classList.remove('done'));
    });
  }

  primeInitial();

  /* ---------- Cálculo del índice activo por scroll ---------- */
  let ticking = false;

  function computeIndex() {
    const vh = window.innerHeight;
    const rect = scroller.getBoundingClientRect();

    // Rango útil de scroll dentro del scroller: la parte en que el sticky se mueve “por detrás”
    const usable = Math.max(1, scroller.offsetHeight - sticky.offsetHeight);

    // Progreso: 0 cuando el top del scroller llega al top de la ventana,
    // 1 cuando el bottom del scroller iguala el bottom del sticky.
    const progressed = clamp((-rect.top) / usable, 0, 1);

    // Segmenta en pasos iguales: 0, 1, 2…
    const idx = clamp(Math.round(progressed * (steps - 1)), 0, steps - 1);
    return idx;
  }

  function update() {
    const idx = computeIndex();

    // Activar slide correspondiente
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('on', i <= idx));

    // Lanzar animación solo la primera vez que se entra al slide
    const slide = slides[idx];
    if (slide && once(slide, 'anim')) {
      (animByIndex[idx] || (() => {}))(slide);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  // Primer pintado
  update();

  // Listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    // re-prime por si el layout cambia de alto
    primeInitial();
    update();
  });
})();








/* ============ Terminal de automatizaciones (Slide 3) ============ */
(function(){
  const slide   = document.querySelector('#svcX-tools');
  if (!slide) return;

  const logBox  = slide.querySelector('.term-body');
  const bar     = slide.querySelector('.term-bar b');
  const status  = slide.querySelector('.term-txt');

  function appendLine(text, cls){
    const pre = document.createElement('pre');
    pre.className = `term-line ${cls||''}`.trim();
    pre.textContent = text;
    logBox.appendChild(pre);
    logBox.scrollTop = logBox.scrollHeight; // autoscroll
  }

  function startTerminal(){
    if (slide.__started) return;          // solo una vez
    slide.__started = true;

    let cmds = [];
    try { cmds = JSON.parse(logBox.getAttribute('data-commands') || '[]'); }
    catch(e){ /* ignore */ }

    let totalDelay = 0;
    const totalCmds = cmds.length || 1;

    cmds.forEach((c, idx) => {
      const delay = Number(c.delay || 600);
      totalDelay += delay;

      setTimeout(() => {
        const map = { info:'term-info', ok:'term-ok', warn:'term-warn', err:'term-err',
                      bootstrap:'term-boot', done:'term-ok' };
        const cls = map[c.t] || 'term-info';
        appendLine(c.msg, cls);

        const pct = Math.round(((idx+1)/totalCmds) * 100);
        if (bar)    bar.style.width = pct + '%';
        if (status) status.textContent = (c.t === 'done') ? 'Listo'
                                  : (c.t === 'warn') ? 'Revisa advertencias'
                                  : 'Procesando…';
      }, totalDelay);
    });
  }

  // dispara cuando el slide 3 sea visible
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          startTerminal();
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(slide);
  } else {
    startTerminal();
  }
})();

/* =========== Servicios — Snap Slides (slides 1–3) [robusto] =========== */
(() => {
  const root = document.querySelector('.svcX');
  if (!root) return;

  const vp     = root.querySelector('.svcX-viewport') || null;
  const slides = [...root.querySelectorAll('.svcX-slide')];
  const dots   = [...root.querySelectorAll('.svcX-dots button')];

  const once = (el, key) => {
    if (!el.__ran) el.__ran = {};
    if (el.__ran[key]) return false;
    el.__ran[key] = true;
    return true;
  };

  const setActive = (el) => {
    const idx = slides.indexOf(el);
    slides.forEach(s => s.classList.toggle('is-active', s === el));
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    runAnimations(idx, el);
  };

  function runAnimations(idx, slide){
    // Slide 1 — SAT
    if (idx === 0 && once(slide, 'sat')) {
      const path = slide.querySelector('.pipe');
      if (path){
        const len = 680;
        path.style.strokeDashoffset = len;
        requestAnimationFrame(() => {
          path.style.transition = 'stroke-dashoffset 1.1s ease .1s';
          path.style.strokeDashoffset = '0';
        });
      }
      slide.querySelectorAll('.svcX-list li').forEach((li, i) =>
        setTimeout(() => li.classList.add('done'), 180 * i + 150)
      );
      const badge = slide.querySelector('.badge');
      if (badge){
        setTimeout(() => {
          badge.style.opacity = '1';
          badge.style.transform = 'translateY(0)';
        }, 1100);
      }
    }

    // Slide 2 — Contabilidad
    if (idx === 1 && once(slide, 'contab')) {
      // contadores (soporta .kpi .num y .kpi-num)
      slide.querySelectorAll('.kpi .num, .kpi-num').forEach(span => {
        const target = +span.dataset.to || +span.dataset.count || 0;
        const t0 = performance.now(), dur = 900;
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          span.textContent = Math.round(target * p);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });

      // sparkline
      const spark = slide.querySelector('.spark polyline');
      if (spark){
        spark.style.strokeDashoffset = 800; // baseline
        requestAnimationFrame(() => {
          spark.style.transition = 'stroke-dashoffset 1.2s ease';
          spark.style.strokeDashoffset = '0';
        });
      }

      // barras
      slide.querySelectorAll('.bars .bar').forEach((b, i) =>
        setTimeout(() => b.classList.add('on'), 120 * i + 120)
      );
    }

    // Slide 3 — Herramientas
    if (idx === 2 && once(slide, 'tools')) {
      slide.querySelectorAll('.svcX-chips .chip').forEach((c, i) =>
        setTimeout(() => c.classList.add('on'), 90 * i + 90)
      );
      slide.querySelectorAll('.links line').forEach((ln, i) => {
        ln.style.transition = `stroke-dashoffset .9s ease ${i * 0.15}s`;
        ln.style.strokeDashoffset = '0';
      });
    }
  }

  /* -------- Activación robusta -------- */

  // Decidir el root del observer: solo usar el viewport si realmente tiene scroll vertical en desktop
  const viewStyles = vp ? getComputedStyle(vp) : null;
  const viewportScrolls = vp && /(auto|scroll)/.test(viewStyles?.overflowY || '');
  const useRoot = (window.innerWidth > 1024 && viewportScrolls) ? vp : null;

  // 1) IO con root dinámico
  let io = null;
  if ('IntersectionObserver' in window){
    io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target); });
    }, { root: useRoot, threshold: 0.6 });
    slides.forEach(s => io.observe(s));
  }

  // 2) Fallback por scroll: calcula el slide más cercano al centro del viewport
  const scroller = useRoot ? vp : window;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const vpr = useRoot && vp
        ? vp.getBoundingClientRect()
        : { top: 0, height: window.innerHeight };
      const vCenter = vpr.top + vpr.height / 2;

      let best = Infinity, active = slides[0];
      slides.forEach(s => {
        const r = s.getBoundingClientRect();
        const sCenter = r.top + r.height / 2;
        const delta = Math.abs(sCenter - vCenter);
        if (delta < best) { best = delta; active = s; }
      });
      setActive(active);
      ticking = false;
    });
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // estado inicial
  setActive(slides[0]);

  // 3) Control de clicks en los dots: permite navegar a un slide
  dots.forEach((btn, idx) => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const target = slides[idx];
      if (!target) return;
      if (useRoot && vp){
        // scroll dentro del viewport
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // scroll de la página — compensa cabecera sticky global (~90px)
        const rect = target.getBoundingClientRect();
        const offset = rect.top + window.scrollY - 90;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
})();





  // se agrega animacion a "Primero claridad, luego acción. Si algo no queda claro, no avanzamos."
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("clarityText");
  const txt = "Sin un mapa claro, cualquier camino falla...  Primero entendemos, luego construimos.";
  let i = 0;

  function type() {
    el.textContent = txt.slice(0, i++);
    if (i <= txt.length) setTimeout(type, 60); // ← velocidad
  }

  type();
});
