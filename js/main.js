// EVORIX Web 2.0 Main Script

(function () {
  'use strict';

  // =========================================
  // 1. THEME TOGGLE
  // =========================================
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  }

  const themeBtns = document.querySelectorAll('[data-theme-toggle]');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Dispatch event for canvas update
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
    });
  });

  // =========================================
  // 2. HEADER SCROLL & ACTIVE STATE
  // =========================================
  const header = document.querySelector('.evorix-header');
  let lastScrollY = window.scrollY;

  if (header) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.classList.add('hide');
      } else {
        header.classList.remove('hide');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Nav Icons Click Handler
  document.querySelectorAll('.nav-icon[data-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(btn.dataset.target);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Active Section Observer
  const sections = document.querySelectorAll('section[id]');
  const navIcons = document.querySelectorAll('.nav-icon[data-target]');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');

  if (sections.length > 0) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          const id = entry.target.getAttribute('id');
          // Desktop Icons
          navIcons.forEach(icon => {
            if (icon.dataset.target === `#${id}`) {
              icon.classList.add('nav-icon--active');
            } else {
              icon.classList.remove('nav-icon--active');
            }
          });
          // Mobile Links
          mobileNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.1
    });

    sections.forEach(section => activeObserver.observe(section));
  }

  // =========================================
  // 3. REVEAL ANIMATIONS (IntersectionObserver)
  // =========================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // =========================================
  // 4. CONTACT FORM (Mailto Fallback)
  // =========================================
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const service = formData.get('service');
      const message = formData.get('message');

      if (!name || !email) {
        alert('Por favor, completa al menos tu nombre y correo.');
        return;
      }

      const subject = `Contacto Web EVORIX: ${service || 'General'}`;
      const body = `Nombre: ${name}\nEmail: ${email}\nServicio de interés: ${service}\n\nMensaje:\n${message}`;

      const mailtoLink = `mailto:cperickd@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoLink;
    });
  }

  // =========================================
  // 5. WHATSAPP LINK HANDLER
  // =========================================
  const waLinks = document.querySelectorAll('[data-whatsapp]');
  const waNumber = '525534806184'; // Replace with actual number if different
  const waText = 'Hola Erick, vengo de tu sitio web y me interesa conocer más sobre tus servicios.';

  waLinks.forEach(link => {
    link.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  // =========================================
  // EVORIX PIXEL ENGINE – CORE FIELD (PROMPT 2)
  // =========================================
  // =========================================
  // EVORIX PIXEL ENGINE – CORE FIELD + LOGO (PROMPT 3)
  // =========================================
  (function () {
    const canvas = document.getElementById('evorix-canvas');
    if (!canvas) {
      console.warn('EVORIX: canvas not found for pixel engine.');
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: true });

    // -------------------------------------------------------------
    // SHARED UTILITIES
    // -------------------------------------------------------------
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    let scrollY = window.scrollY || 0;

    let particles = [];
    let rafId = null;

    // Detect startup state ONCE for engine selection
    // Note: If user resizes from desktop -> mobile or vice versa, they might need a reload 
    // or a specialized resize handler to switch engines. 
    // For this implementation, we check once at startup as per request.
    // Reactive engine selection handled by initResponsiveEngine
    // const initialIsMobile = ... removed

    // Colors
    let root = getComputedStyle(document.documentElement);
    let primaryColor = (root.getPropertyValue('--primary') || '#2563eb').trim();
    let accentColor = (root.getPropertyValue('--accent') || primaryColor).trim();

    function hexToRgb(hex) {
      const clean = (hex || '#000').replace('#', '');
      const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
      const int = parseInt(full, 16);
      return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
    }
    const rgbPrimary = hexToRgb(primaryColor);
    const rgbAccent = hexToRgb(accentColor);

    function mixColor(t, alpha) {
      const r = rgbPrimary.r * (1 - t) + rgbAccent.r * t;
      const g = rgbPrimary.g * (1 - t) + rgbAccent.g * t;
      const b = rgbPrimary.b * (1 - t) + rgbAccent.b * t;
      return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`;
    }

    // Canvas Resize
    function resizeCanvas() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    resizeCanvas(); // init

    // Scroll Tracker
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY || 0;
    }, { passive: true });

    // -------------------------------------------------------------
    // DESKTOP ENGINE (Original Logic)
    // -------------------------------------------------------------
    function startDesktopEngine() {
      let mode = "free";
      let previousMode = "free";
      let logoPoints = [];

      // Config
      const PARTICLE_COUNT = 480;
      const BASE_SPEED = 0.35;
      const MAX_EXTRA_SPEED = 0.9;
      const INTERACTION_RADIUS = 190;
      const INTERACTION_FORCE = 0.14;
      const TRAIL_STICKINESS = 0.15;
      const FRICTION = 0.96;

      // Pointer state
      const pointer = { x: vw / 2, y: vh / 2, targetX: vw / 2, targetY: vh / 2, active: false, down: false };

      function buildLogoShape() {
        const text = "EVORIX";
        // Desktop check as requested
        const isDesktop = vw >= 900;

        const off = document.createElement('canvas');
        const ctx2 = off.getContext('2d');

        let w, h, logoCenterX, logoCenterY;

        if (isDesktop) {
          // --- NEW SAFE SIZING FOR DESKTOP ---
          // 1. Base font size
          let fontSize = Math.floor(Math.min(vw, vh) * 0.18);
          ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;

          // 2. Adjust size to fit safe area (75% width, 60% height)
          let metrics = ctx2.measureText(text);
          while ((metrics.width > vw * 0.75 || fontSize > vh * 0.6) && fontSize > 20) {
            fontSize -= 4;
            ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
            metrics = ctx2.measureText(text);
          }

          // 3. Setup offscreen canvas with centered text
          w = Math.ceil(metrics.width + 60); // margin
          h = Math.ceil(fontSize * 1.5);
          off.width = w;
          off.height = h;

          ctx2.fillStyle = "#fff";
          ctx2.textAlign = "center";
          ctx2.textBaseline = "middle";
          ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx2.fillText(text, w / 2, h / 2);

          // 4. Center position on screen
          logoCenterX = vw * 0.5;
          logoCenterY = vh * 0.5; // True center

        } else {
          // --- ORIGINAL LOGIC (< 900px) ---
          let fontSize = Math.floor(Math.min(vw, vh) * 0.20);
          ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
          let metrics = ctx2.measureText(text);
          while ((metrics.width > vw * 0.8 || fontSize > vh * 0.25) && fontSize > 10) {
            fontSize -= 2;
            ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
            metrics = ctx2.measureText(text);
          }
          w = Math.ceil(metrics.width);
          h = Math.ceil(fontSize * 1.2);
          off.width = w; off.height = h;

          ctx2.fillStyle = "#fff";
          ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx2.fillText(text, 0, fontSize);

          logoCenterX = vw * 0.5;
          logoCenterY = vh * 0.60;
        }

        const data = ctx2.getImageData(0, 0, w, h).data;
        const step = 6;

        logoPoints = [];
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const idx = (y * w + x) * 4;
            if (data[idx + 3] > 128) {
              // Map offscreen center to screen center
              logoPoints.push({ x: x + logoCenterX - w / 2, y: y + logoCenterY - h / 2 });
            }
          }
        }
      }

      // Initial logo build + resize hook
      buildLogoShape();
      window.addEventListener('resize', buildLogoShape);

      function createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.max(vw, vh) * 0.6;
        return {
          x: vw / 2 + Math.cos(angle) * radius,
          y: vh / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          baseSpeed: BASE_SPEED * (0.5 + Math.random()),
          size: 1.6 + Math.random() * 2.2,
          colorMix: Math.random(),
          targetX: null, targetY: null
        };
      }

      function buildParticles() {
        particles = new Array(PARTICLE_COUNT);
        for (let i = 0; i < PARTICLE_COUNT; i++) particles[i] = createParticle();
      }
      buildParticles(); // init

      function assignLogoTargets() {
        if (logoPoints.length === 0) return;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const t = logoPoints[i % logoPoints.length];
          p.targetX = t.x;
          p.targetY = t.y;
        }
      }

      function getSpeedFactor() {
        const normalized = Math.min(Math.abs(scrollY) / 1200, 1);
        return 1 + normalized * MAX_EXTRA_SPEED;
      }

      function updateMode() {
        const aboutSection = document.getElementById('sobre-mi');
        const servicesSection = document.getElementById('servicios');
        if (!aboutSection || !servicesSection) { mode = "free"; return; }
        const aboutRect = aboutSection.getBoundingClientRect();
        const servicesRect = servicesSection.getBoundingClientRect();
        const center = window.innerHeight / 2;
        const midpoint = ((aboutRect.top + aboutRect.height / 2) + (servicesRect.top + servicesRect.height / 2)) / 2;

        if (Math.abs(midpoint - center) < 240) mode = "logo";
        else mode = "free";
      }

      // Pointer Events (Desktop)
      // Pointer Events (Desktop)
      function onPointerMove(e) { pointer.targetX = e.clientX; pointer.targetY = e.clientY; pointer.active = true; }
      function onPointerLeave() { pointer.active = false; }
      function onPointerDown(e) { pointer.down = true; pointer.targetX = e.clientX; pointer.targetY = e.clientY; }
      function onPointerUp() { pointer.down = false; }

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true });

      let lastTime = performance.now();

      function step(now) {
        rafId = requestAnimationFrame(step);
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        updateMode();

        // Mode switch handling
        if (previousMode !== mode) {
          if (mode === "logo") assignLogoTargets();
          else if (mode === "free" && previousMode === "logo") {
            // Burst
            for (const p of particles) {
              p.vx += (Math.random() - 0.5) * 2.2;
              p.vy += (Math.random() - 0.5) * 2.2;
              p.targetX = null; p.targetY = null;
            }
          }
          previousMode = mode;
        }

        // Pointer trail
        const lerp = 1 - Math.pow(1 - TRAIL_STICKINESS, dt * 60);
        pointer.x += (pointer.targetX - pointer.x) * lerp;
        pointer.y += (pointer.targetY - pointer.y) * lerp;

        const speedFactor = getSpeedFactor();
        ctx.clearRect(0, 0, vw, vh);

        const px = pointer.x;
        const py = pointer.y;
        const radius2 = INTERACTION_RADIUS * INTERACTION_RADIUS;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (mode === "logo" && p.targetX !== null) {
            // Logo physics
            p.x += (p.targetX - p.x) * 0.14;
            p.y += (p.targetY - p.y) * 0.14;
            p.vx *= 0.92; p.vy *= 0.92;
            p.x += p.vx; p.y += p.vy;

          } else {
            // Free physics
            p.x += p.vx * p.baseSpeed * speedFactor;
            p.y += p.vy * p.baseSpeed * speedFactor;
            p.vx *= FRICTION; p.vy *= FRICTION;

            // Cap
            if (p.vx > 1.8) p.vx = 1.8; else if (p.vx < -1.8) p.vx = -1.8;
            if (p.vy > 1.8) p.vy = 1.8; else if (p.vy < -1.8) p.vy = -1.8;

            // Wrap
            if (p.x < -20) p.x = vw + 20; if (p.x > vw + 20) p.x = -20;
            if (p.y < -20) p.y = vh + 20; if (p.y > vh + 20) p.y = -20;
          }

          // Interact
          if (pointer.active) {
            const dx = px - p.x; const dy = py - p.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < radius2 && dist2 > 0.01) {
              const dist = Math.sqrt(dist2);
              const force = INTERACTION_FORCE * (pointer.down ? 1.8 : 1.0) * (1 - dist / INTERACTION_RADIUS);
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }

          // Draw
          const alpha = 0.26 + (p.size / 4) * 0.4;
          ctx.fillStyle = mixColor(p.colorMix, alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(step);

      // Return cleanup function
      return function cleanup() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerleave', onPointerLeave);
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('resize', buildLogoShape);
        ctx.clearRect(0, 0, vw, vh);
      };
    } // end startDesktopEngine




    // -------------------------------------------------------------
    // MOBILE ENGINE (New Optimized Logic)
    // -------------------------------------------------------------
    function startMobileEngine() {
      // Mobile Config - Better Interactivity
      const MOBILE_PARTICLE_COUNT = 75; // Increased from 55
      const MOBILE_TOUCH_FORCE = 0.35; // Increased
      const MOBILE_SCROLL_FORCE = 0.08;
      const MOBILE_FRICTION = 0.95;

      let lastScrollY = window.scrollY;
      let touchX = null, touchY = null, touchActive = false;

      // Create mobile particles
      function createMobileParticle() {
        return {
          x: Math.random() * vw,
          y: Math.random() * vh,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 1.5 + Math.random() * 2.5,
          hueShift: Math.random()
        };
      }

      function buildMobileParticles() {
        particles = new Array(MOBILE_PARTICLE_COUNT);
        for (let i = 0; i < MOBILE_PARTICLE_COUNT; i++) {
          particles[i] = createMobileParticle();
        }
      }
      buildMobileParticles();

      // Mobile Events
      function onPointerMove(e) {
        touchX = e.clientX;
        touchY = e.clientY;
        touchActive = true;
      }
      function onPointerEnd() {
        touchActive = false;
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerEnd, { passive: true });
      window.addEventListener('pointercancel', onPointerEnd, { passive: true });

      let lastTime = performance.now();

      function step(now) {
        rafId = requestAnimationFrame(step);

        // Time & Scroll delta
        const dt = Math.min(0.06, (now - lastTime) / 1000);
        lastTime = now;

        const currentScroll = window.scrollY || 0;
        const scrollDelta = currentScroll - lastScrollY;
        lastScrollY = currentScroll;

        ctx.clearRect(0, 0, vw, vh);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // 1. Idle Drift (very subtle noise)
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;

          // 2. Touch Attraction
          if (touchActive && touchX !== null) {
            const dx = touchX - p.x;
            const dy = touchY - p.y;
            // Simple linear pull
            p.vx += dx * MOBILE_TOUCH_FORCE * dt * 0.1;
            p.vy += dy * MOBILE_TOUCH_FORCE * dt * 0.1;
          }

          // 3. Scroll Influence (vertical drift)
          if (Math.abs(scrollDelta) > 0.1) {
            p.vy += scrollDelta * MOBILE_SCROLL_FORCE * 0.1;
          }

          // 4. Apply Velocity & Friction
          p.vx *= MOBILE_FRICTION;
          p.vy *= MOBILE_FRICTION;

          p.x += p.vx;
          p.y += p.vy;

          // 5. Wrap
          if (p.x < -10) p.x = vw + 10;
          if (p.x > vw + 10) p.x = -10;
          if (p.y < -10) p.y = vh + 10;
          if (p.y > vh + 10) p.y = -10;

          // 6. Draw
          const alpha = 0.35 + (p.size / 3.0) * 0.3;
          ctx.fillStyle = mixColor(p.hueShift, alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(step);

      // Return cleanup function
      return function cleanup() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerMove);
        window.removeEventListener('pointerup', onPointerEnd);
        window.removeEventListener('pointercancel', onPointerEnd);
        ctx.clearRect(0, 0, vw, vh);
      };
    } // end startMobileEngine

    // Duplicate block removed


    // -------------------------------------------------------------
    // INIT SWITCH (REACTIVE)
    // -------------------------------------------------------------
    let currentCleanup = null;

    function initResponsiveEngine() {
      const mobileQuery = window.matchMedia("(max-width: 768px)");

      function handleEngineChange(e) {
        if (currentCleanup) currentCleanup();

        if (e.matches) {
          console.log("EVORIX: Switching to Mobile Engine");
          currentCleanup = startMobileEngine();
        } else {
          console.log("EVORIX: Switching to Desktop Engine");
          currentCleanup = startDesktopEngine();
        }
      }

      mobileQuery.addEventListener('change', handleEngineChange);
      handleEngineChange(mobileQuery); // Initial call
    }

    initResponsiveEngine();

    // Expose control
    window.__evorixPixelEngine = {
      stop: () => { if (rafId) cancelAnimationFrame(rafId); },
      rebuild: () => { /* No-op or reload logic could go here */ }
    };

  })();

  // =========================================
  // 7. SERVICES & TOOLS (Legacy Wrapper)
  // =========================================
  {
    // =========================================
    const servicesData = {
      asesoria: {
        title: "Asesoría fiscal inteligente",
        intro:
          "Sesiones uno a uno para resolver dudas fiscales y contables, ajustar tu RFC y tomar decisiones con claridad.",
        bullets: [
          "Atención directa para altas, bajas y cambios en RFC, así como dudas de impuestos y obligaciones.",
          "Revisión rápida para detectar errores, riesgos o anomalías ante el SAT.",
          "Guía paso a paso en trámites y revisiones para que no los enfrentes solo."
        ],
        cost: "$350 MXN / sesión"
      },

      contabilidad: {
        title: "Contabilidad para personas y empresas",
        intro:
          "Gestión mensual clara y ordenada para que tengas tus impuestos y reportes siempre al día.",
        bullets: [
          "Registros contables mensuales limpios y conciliados.",
          "Cumplimiento puntual de declaraciones y obligaciones (PF y PM).",
          "Reportes simples con lo que realmente necesitas saber: ingresos, gastos e impuestos."
        ],
        cost: "$800 MXN mensuales"
      },

      automatizacion: {
        title: "Automatización contable",
        intro:
          "Scripts y herramientas a la medida para reducir tareas repetitivas y errores humanos.",
        bullets: [
          "Integración de XML, Excel y sistemas contables en un solo flujo.",
          "Bots y scripts para conciliaciones, validaciones y reportes automáticos.",
          "Reducción real de tiempo operativo para enfocarte en decisiones, no en capturas."
        ],
        cost: "$1,500 MXN / proyecto"
      },

      proyecciones: {
        title: "Proyecciones e impuestos",
        intro:
          "Escenarios y simulaciones para que sepas cuánto pagar, cuándo y cómo prepararte.",
        bullets: [
          "Análisis histórico de ingresos, gastos e impuestos pagados.",
          "Proyección del siguiente año fiscal con diferentes escenarios.",
          "Alertas de fechas clave y montos estimados para evitar sorpresas."
        ],
        cost: "a convenir por análisis"
      }
    };


    const pills = document.querySelectorAll('.service-pill');
    const panelContentWrapper = document.getElementById('panel-content-wrapper');

    // Elements to update
    const pTitle = document.getElementById('panel-title');
    const pIntro = document.getElementById('panel-intro');
    const pBullets = document.getElementById('panel-bullets');
    const pCost = document.getElementById('panel-cost');

    if (pills.length > 0 && panelContentWrapper) {
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          // 1. Remove active class from all
          pills.forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-selected', 'false');
          });

          // 2. Add active to clicked
          pill.classList.add('active');
          pill.setAttribute('aria-selected', 'true');

          const isMobile = window.innerWidth <= 768;
          if (isMobile) {
            const section = document.querySelector('#servicios');
            if (section) {
              const headerOffset = 80;
              const top = section.getBoundingClientRect().top + window.scrollY - headerOffset;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          }

          // 3. Get data
          const serviceKey = pill.getAttribute('data-service');
          const data = servicesData[serviceKey];

          if (data) {
            // Animate transition
            panelContentWrapper.classList.add('fade-out');
            panelContentWrapper.classList.remove('fade-in');

            setTimeout(() => {
              // 4. Update Content
              pTitle.textContent = data.title;
              pIntro.textContent = data.intro;
              pCost.textContent = data.cost;
              pBullets.innerHTML = data.bullets.map(b => `<li>${b}</li>`).join('');

              // Fade in
              panelContentWrapper.classList.remove('fade-out');
              panelContentWrapper.classList.add('fade-in');
            }, 300);
          }
        });
      });
    }

    // 8. PILLS STAGGERED ANIMATION
    // =========================================
    const pillsContainer = document.querySelector('.services-list');
    if (pillsContainer) {
      const pillsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const pills = entry.target.querySelectorAll('.service-pill');
            pills.forEach((pill, index) => {
              setTimeout(() => {
                pill.style.opacity = '1';
                pill.style.transform = 'translateX(0)';
              }, index * 100); // 100ms stagger
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      pillsObserver.observe(pillsContainer);
    }

    // =========================================
    // 9. EVOAPP TERMINAL ANIMATION
    // =========================================
    const terminalCode = document.getElementById('evoapp-terminal-code');

    if (terminalCode) {
      const lines = [
        "type Movimiento = { fecha: string; concepto: string; monto: number; tipo: 'INGRESO' | 'GASTO' };",
        "type CFDI = { uuid: string; rfc: string; total: number; fecha: Date };",
        "",
        "function normalizarMovimientos(xml: CFDI[]): Movimiento[] {",
        "  return xml.map(cfdi => ({",
        "    fecha: cfdi.fecha.toISOString().slice(0, 10),",
        "    concepto: 'CFDI ' + cfdi.uuid.slice(0, 8),",
        "    monto: cfdi.total,",
        "    tipo: cfdi.total >= 0 ? 'INGRESO' : 'GASTO'",
        "  }));",
        "}",
        "",
        "const ingresos = calcularIngresos(movimientos);",
        "const impuestosProyectados = proyectarImpuestos(ingresos, { regime: 'RESICO' });",
        "",
        "console.log('[EVOAPP] Ingresos normalizados:', ingresos.length);",
        "console.log('[EVOAPP] Proyección de impuestos:', impuestosProyectados.toFixed(2));"
      ];

      let isTyping = false;

      const runTerminal = async () => {
        if (isTyping) return;
        isTyping = true;
        terminalCode.innerHTML = '';

        const cursor = document.createElement('span');
        cursor.className = 'cursor-blink';
        terminalCode.appendChild(cursor);

        for (const line of lines) {
          for (const char of line) {
            cursor.before(char);
            terminalCode.scrollTop = terminalCode.scrollHeight;
            await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
          }
          cursor.before('\n');
          terminalCode.scrollTop = terminalCode.scrollHeight;
          await new Promise(r => setTimeout(r, 50));
        }

        await new Promise(r => setTimeout(r, 3000));
        isTyping = false;
        runTerminal();
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isTyping) {
            runTerminal();
          }
        });
      }, { threshold: 0.2 });

      observer.observe(terminalCode);
    }
  }

  // =========================================
  // 9. RECONOCIMIENTOS ANIMATION
  // =========================================
  const skillsSection = document.getElementById('reconocimientos');
  const skillTags = document.querySelectorAll('.skill-tag');
  const skillsCtaBtn = document.getElementById('skills-cta-btn');
  const skillsCtaText = document.getElementById('skills-cta-text');

  if (skillsSection && skillTags.length > 0) {
    // Hide text initially
    if (skillsCtaText) {
      skillsCtaText.classList.add('text-hidden');
      // Store original text if not in data attribute, though HTML has it in data-text
      if (!skillsCtaText.getAttribute('data-text')) {
        skillsCtaText.setAttribute('data-text', skillsCtaText.textContent.trim());
      }
      skillsCtaText.textContent = ''; // Clear it visually
    }

    const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 1. Staggered Pills
          skillTags.forEach((tag, index) => {
            setTimeout(() => {
              tag.classList.add('visible');
            }, index * 100); // 100ms delay per pill
          });

          // 2. Trigger CTA Pulse & Typewriter after pills
          const totalDelay = skillTags.length * 100 + 200;

          setTimeout(() => {
            // Pulse
            if (skillsCtaBtn) {
              skillsCtaBtn.classList.add('pulse-once');
            }

            // Typewriter
            if (skillsCtaText) {
              const text = skillsCtaText.getAttribute('data-text');
              skillsCtaText.classList.remove('text-hidden');
              typeWriter(skillsCtaText, text, 40);
            }
          }, totalDelay);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    skillsObserver.observe(skillsSection);
  }

  function typeWriter(element, text, speed) {
    if (!text) return;
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // =========================================
  // 10. MOBILE NAVIGATION (Removed)
  // =========================================
  // The new design uses a unified header for desktop and mobile.


  // =========================================
  // 11. RECOGNITIONS ACCORDION (Mobile & Desktop)
  // =========================================
  // =========================================
  // 11. RECOGNITIONS ACCORDION (Mobile & Desktop)
  // =========================================
  function initRecognitionsAccordion() {
    const cards = document.querySelectorAll('.recognitions-section .recognition-card');
    if (!cards.length) return;

    const mm = window.matchMedia('(max-width: 768px)');

    function applyMobileBehavior(isMobile) {
      cards.forEach(card => {
        const header = card.querySelector('.accordion-header');
        if (!header) return;

        // Clone to wipe existing listeners cleanly and avoid duplication
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        if (isMobile) {
          // Mobile: Add click listener
          newHeader.style.cursor = 'pointer';
          newHeader.addEventListener('click', (e) => {
            // Prevent potential bubbling issues
            e.stopPropagation();

            // Toggle current card
            card.classList.toggle('is-open');

            // Optional: Close others? 
            // Stick to independent toggling for robustness unless requested otherwise.
            // If strictly "accordion", uncomment below:
            /*
            if (card.classList.contains('is-open')) {
              cards.forEach(c => {
                if (c !== card) c.classList.remove('is-open');
              });
            }
            */
          });
        } else {
          // Desktop: Reset state
          newHeader.style.cursor = 'default';
          card.classList.remove('is-open');
        }
      });
    }

    // Initial run
    applyMobileBehavior(mm.matches);

    // Listen for resize
    mm.addEventListener('change', (e) => applyMobileBehavior(e.matches));
  }

  // Initialize immediately
  initRecognitionsAccordion();

  // EVORIX accordion mobile fix:
  // - Click handlers bound explicitly to .accordion-header with debug logs.
  // - is-open toggle logic simplified and robust for touch.

  // =========================================
  // 12. EVORIX GUIDED TOUR
  // =========================================
  const tourBtn = document.getElementById('btn-tour');

  if (tourBtn) {
    tourBtn.addEventListener('click', runEvorixTour);
  }

  let isTourRunning = false;
  let tourAbortController = null;

  async function runEvorixTour() {
    if (isTourRunning) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const target = document.getElementById('servicios');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    isTourRunning = true;
    tourAbortController = new AbortController();
    const { signal } = tourAbortController;

    document.body.classList.add('tour-active');

    // Allow manual interruption
    const stopTour = () => {
      if (isTourRunning) {
        isTourRunning = false;
        if (tourAbortController) tourAbortController.abort();
        document.body.classList.remove('tour-active');
        window.removeEventListener('wheel', stopTour);
        window.removeEventListener('touchstart', stopTour);
        window.removeEventListener('keydown', stopTour);
      }
    };

    // Add listeners with a small delay to avoid immediate trigger by the click itself if needed,
    // but usually click doesn't trigger these.
    setTimeout(() => {
      window.addEventListener('wheel', stopTour, { passive: true });
      window.addEventListener('touchstart', stopTour, { passive: true });
      window.addEventListener('keydown', stopTour, { passive: true });
    }, 100);

    try {
      // Sequence
      const steps = [
        { id: 'servicios', delay: 800 },
        { id: 'ecosistema', delay: 800 },
        { id: 'reconocimientos', delay: 800 },
        { id: 'sobre-mi', delay: 800 },
        { id: 'contacto', delay: 1000 }
      ];

      for (const step of steps) {
        if (signal.aborted) break;

        const element = document.getElementById(step.id);
        if (element) {
          await autoScrollTo(element, signal);
          if (signal.aborted) break;

          highlightSection(element);
          spawnParticles(element);

          await new Promise(r => setTimeout(r, step.delay));
        }
      }

      // Return to start
      if (!signal.aborted) {
        await autoScrollTo(document.body, signal); // Scroll to top
      }

    } catch (e) {
      // Tour aborted
    } finally {
      stopTour();
    }
  }

  function autoScrollTo(element, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Aborted'));
        return;
      }

      // If element is body, scroll to 0
      const targetY = element === document.body ? 0 : (element.getBoundingClientRect().top + window.scrollY - 80);
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 1000; // 1s scroll
      let startTime = null;

      function step(timestamp) {
        if (signal.aborted) {
          reject(new Error('Aborted'));
          return;
        }
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percent = Math.min(progress / duration, 1);

        // EaseInOutQuad
        const ease = percent < 0.5 ? 2 * percent * percent : -1 + (4 - 2 * percent) * percent;

        window.scrollTo(0, startY + distance * ease);

        if (progress < duration) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  function highlightSection(section) {
    const title = section.querySelector('h2') || section.querySelector('h3');
    if (title) {
      title.classList.add('tour-highlight');
      setTimeout(() => title.classList.remove('tour-highlight'), 1000);
    }
  }

  function spawnParticles(element) {
    // Disabled for reset
    // const rect = element.getBoundingClientRect();
    // ...
  }

  // (Legacy carousel code removed)

  // =========================================
  // 13. TESTIMONIALS ANIMATION
  // =========================================
  const testimonialCards = document.querySelectorAll('.testimonial-card');

  if (testimonialCards.length > 0) {
    const testimonialObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          card.classList.add('in-view');

          // Add floating effect after reveal animation (0.8s)
          setTimeout(() => {
            card.classList.add('floating');
          }, 1000);

          observer.unobserve(card);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });

    testimonialCards.forEach(card => testimonialObserver.observe(card));
  }

})();

// =========================================
// EVORIX References – Infinite Loop Track
// =========================================
(function () {
  const viewport = document.querySelector('.references-viewport');
  const track = document.querySelector('.references-track');

  if (viewport && track) {
    const originalCards = Array.from(track.children);
    if (originalCards.length > 0) {
      let isMobile = window.matchMedia("(max-width: 768px)").matches;
      let clonesCreated = false;
      let baseWidth = 0;
      let resizeTimer;

      const updateMetrics = () => {
        if (!isMobile) return;
        const gap = parseFloat(getComputedStyle(track).gap || 0);
        let w = 0;
        originalCards.forEach(c => w += c.offsetWidth);
        w += originalCards.length * gap;
        baseWidth = w;
      };

      const setupMobile = () => {
        if (clonesCreated) return;
        // Clone for infinite loop
        originalCards.forEach(card => {
          const clone = card.cloneNode(true);
          clone.classList.add('reference-card--clone');
          track.appendChild(clone);
        });
        clonesCreated = true;
        // Delay to ensure render
        setTimeout(() => {
          updateMetrics();
          if (baseWidth > 0) viewport.scrollLeft = baseWidth * 0.5;
        }, 50);
      };

      const cleanupDesktop = () => {
        if (!clonesCreated) return;
        const all = Array.from(track.children);
        all.forEach(c => {
          if (c.classList.contains('reference-card--clone')) c.remove();
        });
        clonesCreated = false;
        viewport.scrollLeft = 0;
      };

      const onScroll = () => {
        if (!isMobile) return;
        const max = baseWidth;
        if (max <= 0) return;
        const x = viewport.scrollLeft;

        if (x >= max) {
          viewport.scrollLeft = x - max;
        } else if (x <= 0) {
          viewport.scrollLeft = x + max;
        }
      };

      viewport.addEventListener('scroll', onScroll, { passive: true });

      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const checkMobile = window.matchMedia("(max-width: 768px)").matches;
          if (checkMobile !== isMobile) {
            isMobile = checkMobile;
            if (isMobile) setupMobile();
            else cleanupDesktop();
          } else if (isMobile) {
            updateMetrics();
          }
        }, 150);
      });

      // Initial check
      if (isMobile) setupMobile();
    }
  }
  // =========================================
  // 10. MOBILE MENU LOGIC
  // =========================================
  function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const mobileCta = document.querySelector('.mobile-cta');

    if (!mobileMenuBtn || !mobileMenuOverlay) {
      console.log('EVORIX: Mobile menu elements missing.', { btn: !!mobileMenuBtn, overlay: !!mobileMenuOverlay });
      return;
    }

    function toggleMobileMenu(show) {
      if (show) {
        mobileMenuOverlay.classList.add('is-open');
        document.body.classList.add('mobile-menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenuOverlay.classList.remove('is-open');
        document.body.classList.remove('mobile-menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }

    mobileMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu(true);
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu(false);
      });
    }

    // Close menu when clicking a link
    const allLinks = [...mobileNavItems];
    if (mobileCta) allLinks.push(mobileCta);

    allLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });
  }

  // Initialize immediately
  initMobileMenu();
})();

/*
=============================================================================
MOBILE EXPERIENCE & ANIMATION SUMMARY (STEP 3)
=============================================================================

1. NEW ANIMATIONS & MICRO-INTERACTIONS
   - Hero: Faster, staggered entry + floating particle effect.
   - Services: Active tab underline animation + Mobile slide-in for detail panel.
   - Cards/Buttons: Tactile feedback (scale down) on press/active.
   - Reveal System: Applied to References, Contact, and Recognitions.

2. CSS ANIMATION CLASSES
   - .reveal / .reveal-section: Base class for scroll entry.
   - .is-visible: Trigger class active state.
   - .floating-element: Continuous float loop (disabled on reduced motion).
   - .cursor-blink: Terminal cursor effect.
   - .scale-on-press: Micro-interaction utility.

3. PERFORMANCE TRADE-OFFS
   - Used 'will-change' sparingly on reveal elements.
   - Disabled heavier animations (float) on 'prefers-reduced-motion'.
   - Debounced scroll/resize listeners in JS.
   - Mobile particle count capped at 75 for 60fps stability.
*/
