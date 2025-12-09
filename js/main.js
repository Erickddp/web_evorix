// EVORIX Web 2.0 Main Script

(function () {
  'use strict';

  // =========================================
  // 1. THEME TOGGLE (REBUILT & SIMPLIFIED)
  // =========================================
  (function initThemeToggle() {
    const root = document.documentElement;
    const THEME_KEY = 'evorix-theme';
    const btn = document.querySelector('.theme-toggle-btn, [data-theme-toggle]');

    function applyTheme(theme) {
      const value = (theme === 'light' || theme === 'dark') ? theme : 'dark';
      root.setAttribute('data-theme', value);
      try {
        localStorage.setItem(THEME_KEY, value);
      } catch (_) { }

      // Optional: Dispatch event for other components if needed
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: value } }));
    }

    function detectInitialTheme() {
      try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark') {
          return stored;
        }
      } catch (_) { }
      const prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    const initial = detectInitialTheme();
    applyTheme(initial);

    // Attach to all possible toggle buttons
    const btns = document.querySelectorAll('.theme-toggle-btn, [data-theme-toggle]');
    btns.forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(current);

        // Icon Animation (Optional preservation)
        const icon = b.querySelector(".theme-toggle-icon, .icon-theme");
        if (icon) {
          icon.classList.remove("theme-toggle--animating");
          void icon.offsetWidth;
          icon.classList.add("theme-toggle--animating");
          setTimeout(() => icon.classList.remove("theme-toggle--animating"), 300);
        }
      });
    });
  })();

  // =========================================
  // 2. HEADER SCROLL & ACTIVE STATE
  // =========================================
  const header = document.querySelector('.evorix-header');

  if (header) {
    const onScroll = () => {
      if (window.scrollY > 80) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load
    onScroll();
  }

  // Nav Icons Click Handler
  document.querySelectorAll('.nav-icon[data-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.target; // includes #
      const target = document.querySelector(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Active Section Observer implementation (Simpler \u0026 robust)
  const sections = document.querySelectorAll('section[id]');
  const navIcons = document.querySelectorAll('.nav-icon[data-target]');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');

  function updateActiveNav() {
    let currentId = '';

    // Find the section closest to the top-middle of viewport
    // Or just the first one that has its top near the window top
    const viewportMiddle = window.innerHeight / 3;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      // Check if scroll is within this section's vertical range
      if (window.scrollY >= (sectionTop - viewportMiddle) &&
        window.scrollY < (sectionTop + sectionHeight - viewportMiddle)) {
        currentId = '#' + section.getAttribute('id');
      }
    });

    // Fallback: if at top, maybe first section or none
    if (window.scrollY < 50) {
      currentId = (sections[0]) ? '#' + sections[0].getAttribute('id') : '';
    }

    // Update active classes
    navIcons.forEach(icon => {
      if (icon.dataset.target === currentId) {
        icon.classList.add('nav-item--active');
        icon.classList.remove('nav-icon--active'); // cleanup old class
      } else {
        icon.classList.remove('nav-item--active');
        icon.classList.remove('nav-icon--active');
      }
    });

    // Also update mobile links if they exist
    mobileNavLinks.forEach(link => {
      if (link.getAttribute('href') === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  // Init
  updateActiveNav();



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
  // EVORIX PIXEL ENGINE – GLOBAL BACKGROUND (REBUILT)
  // =========================================
  (function initGlobalEvorixCanvas() {
    const canvas = document.getElementById('evorix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let mode = 'hero'; // 'hero' | 'apps' | 'free'
    let width = 0;
    let height = 0;
    let particles = [];
    let rafId = null;

    // Expose mode setter
    function setMode(next) {
      if (next === 'hero' || next === 'apps' || next === 'free') {
        mode = next;
      }
    }
    window.__evorixCanvasSetMode = setMode;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles = [];
      const count = (width < 768) ? 80 : 180; // Optimized count
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.4 + Math.random() * 1.6
        });
      }
    }

    function update() {
      const centerX = width * 0.5;
      const centerY = height * 0.45;
      const appsX = width * 0.65;
      const appsY = height * 0.75;

      for (const p of particles) {
        // Base drift
        p.x += p.vx;
        p.y += p.vy;

        // Section-based attraction
        if (mode === 'hero') {
          p.vx += (centerX - p.x) * 0.0004;
          p.vy += (centerY - p.y) * 0.0004;
        } else if (mode === 'apps') {
          p.vx += (appsX - p.x) * 0.0004;
          p.vy += (appsY - p.y) * 0.0004;
        }

        // Wrap around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Fixed bright blue for visibility in both themes
      ctx.fillStyle = '#1f6bff';
      ctx.globalAlpha = 0.8;

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    function loop() {
      update();
      draw();
      rafId = requestAnimationFrame(loop);
    }

    // Startup
    resize();
    initParticles();
    loop();

    // Listeners
    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
  })();

  // =========================================
  // EVORIX CANVAS SECTION OBSERVER
  // =========================================
  (function initEvorixCanvasSections() {
    const setMode = window.__evorixCanvasSetMode;
    // Wait slightly for main engine to init if needed, though script runs seq
    if (typeof setMode !== 'function') return;

    // Selectors matching index.html
    const hero = document.getElementById('inicio'); // Hero section
    const apps = document.getElementById('ecosistema'); // EVOAPPs section

    if (!hero || !apps) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        // Simple heuristic: check who is intersecting effectively
        // We just want to know if specific sections are "mostly" in view
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'inicio') setMode('hero');
            else if (entry.target.id === 'ecosistema') setMode('apps');
          } else {
            // If leaving hero or apps, revert to free? 
            // Logic: keep last set mode until new one overrides, or default free if none.
            // Simplification: Let the observer entry logic handle the "entrance" triggers.
          }
        });
      }, { threshold: 0.5 }); // 50% visible triggers mode

      io.observe(hero);
      io.observe(apps);

      // Also observe "in-between" sections to switch to free?
      // For now, let's keep it robust: Hero -> Hero Mode, Eco -> Apps Mode.
      // We can add a catch-all scroller if needed, but IO is lighter.

      // Better approach for strict mode switching: 
      // Observe ALL main sections and decide.
      const mixedIO = new IntersectionObserver(entries => {
        // Sort by intersection ratio to find dominant section
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (id === 'inicio') setMode('hero');
          else if (id === 'ecosistema') setMode('apps');
          else setMode('free');
        }
      }, { threshold: [0.2, 0.5, 0.8] });

      document.querySelectorAll('section[id]').forEach(s => mixedIO.observe(s));

    } else {
      // Fallback
      window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        const hHeight = hero.offsetHeight;
        const appsTop = apps.offsetTop;

        if (scroll < hHeight * 0.6) setMode('hero');
        else if (scroll > appsTop - 400 && scroll < appsTop + apps.offsetHeight) setMode('apps');
        else setMode('free');
      }, { passive: true });
    }
  })();

  // =========================================
  // 10. HERO TITLE PULSE ANIMATION
  // =========================================
  (function setupHeroTitlePulse() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    // Evitar animación excesiva: pequeño pulso cada ~8 segundos
    const PULSE_INTERVAL = 8000;
    const PULSE_DURATION = 1100;

    setInterval(() => {
      heroTitle.classList.add('hero-pulse');
      setTimeout(() => {
        heroTitle.classList.remove('hero-pulse');
      }, PULSE_DURATION);
    }, PULSE_INTERVAL);
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

      const TOUR_FIRST_SCROLL_DURATION = 700;   // Fast entry
      const TOUR_SCROLL_DURATION = 2000;  // Relaxed flow
      const TOUR_STEP_DELAY = 1200;  // Pause

      // Sequence
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const steps = [
        { id: 'servicios', delay: isMobile ? 3000 : TOUR_STEP_DELAY },
        { id: 'ecosistema', delay: TOUR_STEP_DELAY },
        { id: 'reconocimientos', delay: TOUR_STEP_DELAY },
        { id: 'sobre-mi', delay: TOUR_STEP_DELAY },
        { id: 'contacto', delay: 1500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        if (signal.aborted) break;

        const step = steps[i];
        const element = document.getElementById(step.id);

        if (element) {
          // First jump is fast/immediate, subsequent are slow
          const duration = (i === 0) ? TOUR_FIRST_SCROLL_DURATION : TOUR_SCROLL_DURATION;

          await autoScrollTo(element, signal, duration);

          if (signal.aborted) break;

          highlightSection(element);
          spawnParticles(element);

          // Mobile-specific behavior for Servicios -> Demo horizontal scroll
          if (step.id === 'servicios' && window.matchMedia('(max-width: 768px)').matches) {
            // Run sequence asynchronously (fire & forget relative to main loop wait)
            (async () => {
              // 1. Wait small entry timeout
              await new Promise(r => setTimeout(r, 150));

              // 2. Trigger Tab Selection (Concurrent)
              demoServicesTabSelection();

              // 3. Trigger Scroll Cycles
              for (let k = 0; k < 3; k++) {
                await demoServicesHorizontalScroll();
                if (k < 2) await new Promise(r => setTimeout(r, 300));
              }
            })();
          }

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

  function autoScrollTo(element, signal, duration) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Aborted'));
        return;
      }

      // If element is body, scroll to 0
      const targetY = element === document.body ? 0 : (element.getBoundingClientRect().top + window.scrollY - 80);
      const startY = window.scrollY;
      const distance = targetY - startY;
      const scrollDuration = duration || 2000;
      let startTime = null;

      function step(timestamp) {
        if (signal.aborted) {
          reject(new Error('Aborted'));
          return;
        }
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percent = Math.min(progress / scrollDuration, 1);

        // EaseInOutQuad
        const ease = percent < 0.5 ? 2 * percent * percent : -1 + (4 - 2 * percent) * percent;

        window.scrollTo(0, startY + distance * ease);

        if (progress < scrollDuration) {
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

  function demoServicesHorizontalScroll() {
    return new Promise((resolve) => {
      if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) {
        resolve();
        return;
      }

      const servicesList = document.querySelector('.services-list[role="tablist"]');
      if (!servicesList) {
        resolve();
        return;
      }

      const maxScroll = servicesList.scrollWidth - servicesList.clientWidth;
      if (maxScroll <= 0) {
        resolve();
        return;
      }

      const targetScroll = Math.min(maxScroll, servicesList.clientWidth * 0.8);
      const duration = 700;
      const start = servicesList.scrollLeft;
      const startTime = performance.now();

      function animate(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        // EaseInOut
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        servicesList.scrollLeft = start + (targetScroll - start) * ease;

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          // Scroll back slightly
          setTimeout(() => {
            servicesList.scrollTo({
              left: servicesList.scrollLeft * 0.6,
              behavior: 'smooth'
            });
            resolve(); // Resolve here, allowing next cycle to wait 300ms after this finishes
          }, 100);
        }
      }

      requestAnimationFrame(animate);
    });
  }

  function demoServicesTabSelection() {
    // Only on mobile
    if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;

    const servicesList = document.querySelector('.services-list[role="tablist"]');
    if (!servicesList) return;

    const tabs = servicesList.querySelectorAll('[role="tab"]');
    if (!tabs || tabs.length === 0) return;

    // Sequence: tabs[1] -> tabs[2] (if exists) -> tabs[0]
    // Interval: 400ms
    (async () => {
      // 1. Select Tab 2
      if (tabs.length > 1) {
        await new Promise(r => setTimeout(r, 400));
        tabs[1].click();
      }

      // 2. Select Tab 3
      if (tabs.length > 2) {
        await new Promise(r => setTimeout(r, 400));
        tabs[2].click();
      }

      // 3. Return to Tab 1
      if (tabs.length > 0) {
        await new Promise(r => setTimeout(r, 400));
        tabs[0].click();
      }
    })();
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
  // (Old mobile menu logic removed to prevent conflicts)
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

// =========================================
// 15. MOBILE MENU (SIMPLE TOGGLE)
// =========================================

// === EVOAPP mini canvases (independent from evorix-canvas) ===
(function initMiniEvoappCanvases() {
  const canvases = document.querySelectorAll('.evoapp-mini-canvas');
  if (!canvases.length) return;

  function buildLogoPoints(width, height) {
    const off = document.createElement('canvas');
    const ctx2 = off.getContext('2d');
    off.width = width;
    off.height = height;

    ctx2.clearRect(0, 0, width, height);

    // Use height-based font size so letters are tall inside the bar
    const fontSize = height * 0.65; // 65% of bar height
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.font = `900 ${fontSize}px system-ui`;

    // Draw a thick stroke + fill so the glyph has volume
    ctx2.lineWidth = fontSize * 0.18; // thick outline
    ctx2.strokeStyle = '#ffffff';
    ctx2.fillStyle = '#ffffff';

    const cx = width / 2;
    const cy = height * 0.55;

    ctx2.strokeText('EVO TOOLS', cx, cy);
    ctx2.fillText('EVO TOOLS', cx, cy);

    const imageData = ctx2.getImageData(0, 0, width, height).data;
    const points = [];
    const step = 2; // denser sampling for clearer letters

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4 + 3; // alpha channel
        if (imageData[idx] > 80) { // lower threshold to capture more pixels
          points.push({ x, y });
        }
      }
    }
    return points;
  }

  Array.from(canvases).forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const parent = canvas.closest('.dash-module');
    const particles = [];
    let logoPoints = [];
    let width = 0;
    let height = 0;
    let speedBoost = 1.3;
    let mode = 'free';
    let animationId;

    function assignTargets() {
      if (!logoPoints.length || !particles.length) return;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const target = logoPoints[i % logoPoints.length];
        p.tx = target.x;
        p.ty = target.y;
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

      logoPoints = buildLogoPoints(width, height);
      assignTargets();
    }

    function initParticles() {
      particles.length = 0;
      const count = 70;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push({
          x: x, y: y,
          vx: (Math.random() - 0.5) * 0.85,
          vy: (Math.random() - 0.5) * 0.85,
          r: 1.6 + Math.random() * 1.8,
          tx: 0, ty: 0,
          homeX: x, homeY: y
        });
      }
      assignTargets();
    }

    function update() {
      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 0.8;

      const style = getComputedStyle(document.documentElement);
      const color = style.getPropertyValue('--primary').trim();
      ctx.fillStyle = color || '#1f6bff';

      const logoLerp = (mode === 'logo') ? 0.08 : 0.0;

      for (const p of particles) {
        if (mode === 'logo' && logoPoints.length) {
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.x += dx * logoLerp;
          p.y += dy * logoLerp;
        } else {
          p.x += p.vx * speedBoost;
          p.y += p.vy * speedBoost;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      update();
      animationId = requestAnimationFrame(loop);
    }

    // Init
    resize();
    initParticles();
    loop();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    if (parent) {
      parent.addEventListener('pointerenter', () => {
        speedBoost = 3.0; // much more energetic on hover
        mode = 'logo';
      });
      parent.addEventListener('pointerleave', () => {
        speedBoost = 1.3;
        mode = 'free';
        // Randomize velocity on exit
        particles.forEach(p => {
          p.vx = (Math.random() - 0.5) * 0.85;
          p.vy = (Math.random() - 0.5) * 0.85;
        });
      });
      parent.addEventListener('click', () => {
        mode = 'logo';
      });
    }
  });
})();






