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

  const themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Dispatch event for canvas update
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
    });
  }

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

  if (sections.length > 0 && navIcons.length > 0) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Clean active state
          // Note: This simple logic might flicker if multiple sections are visible.
          // Better to highlight the one most visible or just the entry that triggered.
          // For simplicity we just add active to intersecting and remove from others? 
          // IntersectionObserver fires for ALL changes.
          if (entry.intersectionRatio > 0) {
            const id = entry.target.getAttribute('id');
            navIcons.forEach(icon => {
              if (icon.dataset.target === `#${id}`) {
                icon.classList.add('nav-icon--active');
              } else {
                icon.classList.remove('nav-icon--active');
              }
            });
          }
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
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

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    // State
    let particles = [];
    let scrollY = window.scrollY || 0;
    let mode = "free"; // "free" | "logo"
    let previousMode = "free";
    let logoPoints = [];

    // Configuration
    const isMobile = vw < 768;
    const PARTICLE_COUNT = isMobile ? 220 : 480;
    const BASE_SPEED = 0.35;
    const MAX_EXTRA_SPEED = 0.9;
    const INTERACTION_RADIUS = isMobile ? 140 : 190;
    const INTERACTION_FORCE = 0.14;
    const TRAIL_STICKINESS = 0.15;
    const FRICTION = 0.96;

    // Colors
    let root = getComputedStyle(document.documentElement);
    let primaryColor = (root.getPropertyValue('--primary') || root.getPropertyValue('--color-primary') || '#2563eb').trim();
    let accentColor = (root.getPropertyValue('--accent') || root.getPropertyValue('--color-accent') || primaryColor).trim();

    function hexToRgb(hex) {
      const clean = (hex || '#000').replace('#', '');
      const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
      const int = parseInt(full, 16);
      return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255
      };
    }

    const rgbPrimary = hexToRgb(primaryColor);
    const rgbAccent = hexToRgb(accentColor);

    function mixColor(t, alpha) {
      const r = rgbPrimary.r * (1 - t) + rgbAccent.r * t;
      const g = rgbPrimary.g * (1 - t) + rgbAccent.g * t;
      const b = rgbPrimary.b * (1 - t) + rgbAccent.b * t;
      return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`;
    }

    function buildLogoShape() {
      const off = document.createElement('canvas');
      const ctx2 = off.getContext('2d');
      const text = "EVORIX";

      // Responsive font size calculation
      let fontSize = Math.floor(Math.min(vw, vh) * 0.20);
      ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;

      // Measure and clamp
      let metrics = ctx2.measureText(text);
      while ((metrics.width > vw * 0.8 || fontSize > vh * 0.25) && fontSize > 10) {
        fontSize -= 2;
        ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
        metrics = ctx2.measureText(text);
      }

      const w = Math.ceil(metrics.width);
      const h = Math.ceil(fontSize * 1.2);

      off.width = w;
      off.height = h;

      ctx2.fillStyle = "#fff";
      ctx2.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx2.fillText(text, 0, fontSize);

      const data = ctx2.getImageData(0, 0, w, h).data;
      const step = isMobile ? 4 : 6;

      logoPoints = [];

      // Center in viewport (fixed relative to screen, not document)
      const logoCenterX = vw * 0.5;
      const logoCenterY = vh * 0.60;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = (y * w + x) * 4;
          if (data[idx + 3] > 128) {
            logoPoints.push({
              x: x + logoCenterX - w / 2,
              y: y + logoCenterY - h / 2
            });
          }
        }
      }
    }

    function resize() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLogoShape();
    }
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    resize();

    // Particle Factory
    function createParticle() {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.max(vw, vh) * 0.6;

      const x = vw / 2 + Math.cos(angle) * radius;
      const y = vh / 2 + Math.sin(angle) * radius;

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseSpeed: BASE_SPEED * (0.5 + Math.random()),
        size: isMobile ? 1.4 + Math.random() * 1.6 : 1.6 + Math.random() * 2.2,
        colorMix: Math.random(),
        targetX: null,
        targetY: null
      };
    }

    function buildParticles() {
      particles = new Array(PARTICLE_COUNT);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles[i] = createParticle();
      }
    }
    buildParticles();

    function assignLogoTargets() {
      if (logoPoints.length === 0) return;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const t = logoPoints[i % logoPoints.length];
        p.targetX = t.x;
        p.targetY = t.y;
      }
    }

    // Interaction
    const pointer = {
      x: vw / 2,
      y: vh / 2,
      targetX: vw / 2,
      targetY: vh / 2,
      active: false,
      down: false
    };

    function onPointerMove(e) {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
    }
    function onPointerLeave() {
      pointer.active = false;
    }
    function onPointerDown(e) {
      pointer.down = true;
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
    }
    function onPointerUp() {
      pointer.down = false;
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });

    function updatePointer(dt) {
      const lerp = 1 - Math.pow(1 - TRAIL_STICKINESS, dt * 60);
      pointer.x += (pointer.targetX - pointer.x) * lerp;
      pointer.y += (pointer.targetY - pointer.y) * lerp;
    }

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY || 0;
    }, { passive: true });

    function getSpeedFactor() {
      const normalized = Math.min(Math.abs(scrollY) / 1200, 1);
      return 1 + normalized * MAX_EXTRA_SPEED;
    }

    function updateMode() {
      const aboutSection = document.getElementById('sobre-mi');
      const servicesSection = document.getElementById('servicios');

      if (!aboutSection || !servicesSection) {
        mode = "free";
        return;
      }

      const aboutRect = aboutSection.getBoundingClientRect();
      const servicesRect = servicesSection.getBoundingClientRect();

      const center = window.innerHeight / 2;
      const aboutCenter = aboutRect.top + aboutRect.height / 2;
      const servicesCenter = servicesRect.top + servicesRect.height / 2;

      // midpoint between the two sections
      const midpoint = (aboutCenter + servicesCenter) / 2;

      if (Math.abs(midpoint - center) < 240) {
        mode = "logo";
      } else {
        mode = "free";
      }
    }

    function drawParticle(p) {
      const alpha = 0.26 + (p.size / 4) * 0.4;
      ctx.fillStyle = mixColor(p.colorMix, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Animation Loop
    let lastTime = performance.now();
    let rafId = null;

    function step(now) {
      rafId = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      updateMode();

      // Transition handling
      if (previousMode !== mode) {
        if (mode === "logo") {
          assignLogoTargets();
        } else if (mode === "free" && previousMode === "logo") {
          // Burst
          for (const p of particles) {
            p.vx += (Math.random() - 0.5) * 2.2;
            p.vy += (Math.random() - 0.5) * 2.2;
            p.targetX = null;
            p.targetY = null;
          }
        }
        previousMode = mode;
      }

      updatePointer(dt);
      const speedFactor = getSpeedFactor();

      ctx.clearRect(0, 0, vw, vh);

      const px = pointer.x;
      const py = pointer.y;
      const hasPointer = pointer.active;
      const radius2 = INTERACTION_RADIUS * INTERACTION_RADIUS;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mode === "logo" && p.targetX !== null) {
          // Logo formation physics
          const lerp = 0.14;
          // Move towards target
          p.x += (p.targetX - p.x) * lerp;
          p.y += (p.targetY - p.y) * lerp;

          // Dampen velocity but keep it for pointer interaction
          p.vx *= 0.92;
          p.vy *= 0.92;

          // Apply velocity (allows pointer to push particles)
          p.x += p.vx;
          p.y += p.vy;

        } else {
          // Free mode physics
          p.x += p.vx * p.baseSpeed * speedFactor;
          p.y += p.vy * p.baseSpeed * speedFactor;

          // Friction + Speed Limit
          p.vx *= FRICTION;
          p.vy *= FRICTION;
          const maxVel = 1.8;
          if (p.vx > maxVel) p.vx = maxVel;
          if (p.vx < -maxVel) p.vx = -maxVel;
          if (p.vy > maxVel) p.vy = maxVel;
          if (p.vy < -maxVel) p.vy = -maxVel;

          // Wrap around edges
          const margin = 20;
          if (p.x < -margin) p.x = vw + margin;
          if (p.x > vw + margin) p.x = -margin;
          if (p.y < -margin) p.y = vh + margin;
          if (p.y > vh + margin) p.y = -margin;
        }

        // Pointer attraction (applies in both modes)
        if (hasPointer) {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < radius2 && dist2 > 0.01) {
            const dist = Math.sqrt(dist2);
            const force = INTERACTION_FORCE * (pointer.down ? 1.8 : 1.0) * (1 - dist / INTERACTION_RADIUS);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        drawParticle(p);
      }
    }

    function start() {
      if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(step);
      }
    }
    function stop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    start();

    // Debug API
    window.__evorixPixelEngine = { start, stop, rebuild: buildParticles };
    window.addEventListener('beforeunload', stop, { passive: true });
  })();

  // =========================================
  // 7. SERVICES & TOOLS (Legacy Wrapper)
  // =========================================
  {
    // =========================================
    const servicesData = {
      asesoria: {
        title: "Asesoría fiscal inteligente",
        intro: "Diagnóstico profundo de tu situación fiscal y corrección de errores antes de que se vuelvan problemas.",
        bullets: [
          "Detección de anomalías y riesgos ante el SAT.",
          "Estrategias para optimizar tu carga tributaria legalmente.",
          "Acompañamiento en trámites y revisiones complejas."
        ],
        cost: "$X,XXX MXN / proyecto"
      },
      contabilidad: {
        title: "Contabilidad para personas y empresas",
        intro: "Gestión mensual clara y ordenada para que tengas tus impuestos y reportes siempre al día.",
        bullets: [
          "Registros contables mensuales sin errores.",
          "Cumplimiento de obligaciones fiscales (PF y PM).",
          "Reportes financieros listos para tomar decisiones."
        ],
        cost: "$X,XXX MXN mensuales"
      },
      automatizacion: {
        title: "Automatización contable",
        intro: "Scripts y herramientas a la medida para reducir tareas repetitivas y errores humanos.",
        bullets: [
          "Integración de XML, Excel y sistemas contables.",
          "Bots para conciliaciones, validaciones y proyecciones.",
          "Reducción de carga operativa hasta un 80%."
        ],
        cost: "$X,XXX MXN / proyecto"
      },
      proyecciones: {
        title: "Proyecciones e impuestos",
        intro: "Escenarios y simulaciones para que sepas cuánto pagar, cuándo y cómo prepararte.",
        bullets: [
          "Análisis histórico de ingresos e impuestos pagados.",
          "Proyección del siguiente año fiscal con escenarios.",
          "Alertas de fechas clave y obligaciones importantes."
        ],
        cost: "$X,XXX MXN / análisis"
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
  const accordionCards = document.querySelectorAll('.accordion-card');

  accordionCards.forEach(card => {
    const header = card.querySelector('.accordion-header');

    // Click behavior (Toggle)
    if (header) {
      header.addEventListener('click', (e) => {
        e.preventDefault();

        // Optional: Close others (Accordion behavior)
        // This ensures only one is open at a time, which is cleaner on mobile
        accordionCards.forEach(c => {
          if (c !== card) c.classList.remove('is-open');
        });

        // Toggle current
        card.classList.toggle('is-open');
      });
    }

    // Desktop Hover Behavior
    // Only for devices with fine pointer (mouse)
    if (window.matchMedia('(hover: hover)').matches) {
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-open');
      });

      card.addEventListener('mouseleave', () => {
        if (window.matchMedia('(pointer: fine)').matches) {
          card.classList.remove('is-open');
        }
      });
    }
  });

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

  // =========================================
  // 13. REFERENCES CAROUSEL ANIMATION
  // =========================================
  const referencesCarousel = document.querySelector('.references-carousel');
  if (referencesCarousel) {
    // Duplicate cards for seamless loop
    const cards = Array.from(referencesCarousel.children);
    cards.forEach(card => referencesCarousel.appendChild(card.cloneNode(true)));

    let offset = 0;
    const speed = 0.3; // pixels per frame
    function animateCarousel() {
      offset -= speed;
      referencesCarousel.style.transform = `translateX(${offset}px)`;
      const firstCard = referencesCarousel.firstElementChild;
      if (firstCard) {
        const style = getComputedStyle(firstCard);
        const cardWidth = firstCard.getBoundingClientRect().width + parseFloat(style.marginRight);
        if (Math.abs(offset) >= cardWidth) {
          referencesCarousel.appendChild(firstCard);
          offset += cardWidth;
        }
      }
      requestAnimationFrame(animateCarousel);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animateCarousel();
    }
  }

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
  if (!viewport || !track) return;

  const cards = Array.from(track.children);
  if (cards.length === 0) return;

  // 1) Duplicate the full set once so we have at least 2× items
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('reference-card--clone');
    track.appendChild(clone);
  });

  // 2) Measure width of the original set
  // We need to account for the gap between the last original and first clone
  // The gap property applies between all flex items.
  const gap = parseFloat(getComputedStyle(track).gap || 0);
  let baseWidth = cards.reduce((sum, card) => sum + card.offsetWidth, 0);

  // Correct calculation for seamless loop: Width of items + Width of gaps between them
  // If we have N items, we have N gaps in a full cycle (including the one after the last item leading to the next cycle)
  baseWidth += cards.length * gap;

  function onScroll() {
    const max = baseWidth;
    const x = viewport.scrollLeft;

    // If we scrolled beyond the duplicated set, wrap back
    if (x >= max) {
      viewport.scrollLeft = x - max;
    } else if (x <= 0) {
      // optional: jump forward so you can scroll backwards infinitely
      viewport.scrollLeft = x + max;
    }
  }

  viewport.addEventListener('scroll', onScroll, { passive: true });

  // optional: start in the middle so user can scroll both sides
  viewport.scrollLeft = baseWidth * 0.5;
})();
