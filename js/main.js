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
  // EVORIX PIXEL ENGINE – ADVANCED GLOBAL SYSTEM
  // =========================================
  (function initEvorixAdvancedEngine() {
    const canvas = document.getElementById('evorix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- Configurations ---
    const PARTICLES_DESKTOP = 1800;
    const PARTICLES_MOBILE = 1000;
    const BASE_SPEED = 0.14;
    const EXTRA_SPEED = 0.50; // Extra speed factor for explosive modes
    const MOUSE_RADIUS = 120; // Radius for mouse interaction
    const GHOST_TEXT = "EVORIX";

    // --- State & Variables ---
    let width = 0;
    let height = 0;
    let particles = [];
    let dpr = 1;
    let isMobile = false;

    // Modes: 'free' | 'hero_index' | 'hero_tools' | 'hero_certs' | 'hero_loader' | 'apps' | 'tools' | 'certs' | 'evorixGhost'
    let currentMode = 'free';

    // Interaction
    const mouse = { x: -1000, y: -1000, active: false };

    // Offscreen for Text Sampling (Ghost Mode)
    let ghostPoints = [];
    let isGhostReady = false;

    // --- Global Mode Setter ---
    window.__evorixCanvasSetMode = function (mode) {
      if (mode && mode !== currentMode) {
        // console.log(`[EVORIX] Switching mode: ${currentMode} -> ${mode}`);
        currentMode = mode;

        // Trigger specific entry effects if needed
        if (mode === 'evorixGhost' && !isGhostReady) {
          initGhostPoints();
        }
      }
    };

    // --- Initialization ---
    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width <= 768;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
      if (currentMode === 'evorixGhost') initGhostPoints();
    }

    function initParticles() {
      particles = [];
      const count = isMobile ? PARTICLES_MOBILE : PARTICLES_DESKTOP;

      // Safety cap for extremely small screens or performance
      const effectiveCount = (width < 360) ? Math.round(count * 0.7) : count;

      for (let i = 0; i < effectiveCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * BASE_SPEED,
          vy: (Math.random() - 0.5) * BASE_SPEED,
          // Base/Home coordinates could be used for formation, 
          // but we'll use dynamic targets for Ghost
          baseX: x,
          baseY: y,
          r: isMobile ? (0.8 + Math.random() * 1.2) : (1.0 + Math.random() * 1.5),
          alpha: 0.5 + Math.random() * 0.5,
          // Extra properties for modes
          tx: 0,
          ty: 0,
          inFormation: false
        });
      }
    }

    function initGhostPoints() {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');

      // Font params
      const fontSize = isMobile ? width * 0.18 : width * 0.12;
      offCtx.font = `900 ${fontSize}px "Inter", "Manrope", sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';

      // Draw text centered
      offCtx.fillText(GHOST_TEXT, width / 2, height / 2);

      // Sample pixels
      const imageData = offCtx.getImageData(0, 0, width, height).data;
      ghostPoints = [];

      // Sampling density (higher = sparse)
      const step = isMobile ? 4 : 5;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4 + 3; // alpha
          if (imageData[idx] > 128) {
            ghostPoints.push({ x, y });
          }
        }
      }
      isGhostReady = true;
    }

    // --- Animation Logic ---
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Visual Style
      ctx.fillStyle = '#1f6bff';

      // Mode-specific constants
      const isIndexHero = (currentMode === 'hero_index');
      const isGhost = (currentMode === 'evorixGhost' && isGhostReady && ghostPoints.length > 0);

      // Adjust speed factor dynamically per mode
      let speedMult = 1.0;
      if (isIndexHero) speedMult = 1.4; // Explosive/Fast for Index Hero
      else if (currentMode.includes('hero')) speedMult = 1.1; // Mildly fast for other heroes
      else if (currentMode === 'apps' || currentMode === 'tools') speedMult = 0.8; // Calmer for content

      // Ghost formation helpers
      let assignedPoints = 0;
      const ghostRatio = 0.6; // % of particles used for text

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Movement
        let moveX = p.vx * speedMult;
        let moveY = p.vy * speedMult;

        // Apply "Explosive" / "Extra" speed component purely as noise usually, 
        // but here we just made velocity higher. 
        // We can add slight drift based on mode.
        if (isIndexHero) {
          moveX *= (1 + Math.random() * EXTRA_SPEED);
          moveY *= (1 + Math.random() * EXTRA_SPEED);
        }

        // 2. Ghost Mode Attraction
        if (isGhost) {
          // Use a subset of particles to form text
          if (assignedPoints < ghostPoints.length && i % Math.round(1 / ghostRatio) === 0) {
            // Assign a target if not yet capable, or map index to ghost point linearly (simplest)
            // or random map (more noise). Linear is stable.
            const target = ghostPoints[assignedPoints % ghostPoints.length];
            const dx = target.x - p.x;
            const dy = target.y - p.y;

            // Ease into position
            moveX += dx * 0.04; // Attraction strength
            moveY += dy * 0.04;

            // Dampen velocity to stop at target
            p.vx *= 0.90;
            p.vy *= 0.90;

            assignedPoints++;
          }
        }
        // 3. Central Attraction for certain modes (Apps)
        else if (currentMode === 'apps' || currentMode === 'tools') {
          // Slight pull to center or specific area? 
          // Let's keep it 'free' but bounded, maybe slight pull to Y center
          const cy = height * 0.5;
          moveY += (cy - p.y) * 0.0002;
        }

        // 4. Mouse Interaction (Repulsion or Attraction)
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS) {
            const angle = Math.atan2(dy, dx);
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            const push = force * 2.0; // Push strength

            // Repulsion usually feels better for "clearing the way"
            // Attraction feels like "magic control".
            // User asked for "atracción clara al mouse".
            const interactionDir = -1; // -1 for Attraction, 1 for Repulsion

            // However, attraction can trap particles. 
            // Let's do attraction but with a limit so they orbit or pass through.
            moveX += Math.cos(angle) * push * interactionDir * 0.5;
            moveY += Math.sin(angle) * push * interactionDir * 0.5;
          }
        }

        // Apply
        p.x += moveX;
        p.y += moveY;

        // Verify Bounds (Wrap around)
        // If in Ghost mode & assigned to target, don't wrap tightly?
        // Actually, if they overshoot target, they come back. 
        // Only wrap if they go WAY off screen.
        if (!isGhost) {
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        } else {
          // Loose bounds for stray particles
          if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
            // Respawn closer to center to help formation
            p.x = Math.random() * width;
            p.y = Math.random() * height;
          }
        }

        // Draw
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      requestAnimationFrame(animate);
    }

    // --- Inputs ---
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    // Auto-disable mouse effect if idle? 
    // Not strictly needed but good for performance logic if complex.

    window.addEventListener('touchmove', e => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => { mouse.active = false; });
    window.addEventListener('resize', resize);

    // Boot
    resize();
    animate();

    // =========================================
    // SECTION OBSERVER (Mode Switcher)
    // =========================================
    // This logic automatically finds sections with data-particle-mode
    // and tells the engine to switch.
    (function initModeObserver() {
      if (!('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver((entries) => {
        // Find the most visible target
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const mode = entry.target.getAttribute('data-particle-mode');
            if (mode) window.__evorixCanvasSetMode(mode);
          }
        });
      }, { threshold: [0.1, 0.3, 0.6] });

      const targets = document.querySelectorAll('[data-particle-mode]');
      targets.forEach(el => observer.observe(el));
    })();

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
  // EVORIX GUIDED TOUR (Refactor Configurable)
  // =========================================

  // ---------- CONFIGURACIÓN GLOBAL DEL TOUR ----------
  const TOUR_CONFIG = {
    // Duración estándar del PRIMER scroll (cuando salimos del héroe)
    firstScrollDuration: 600,      // ms

    // Duración estándar de scroll entre secciones (si el paso no define otro)
    scrollDuration: 1100,          // ms

    // Pausa base después de llegar a cada sección (si el paso no define otro)
    stepDelay: 700,                // ms

    // Comportamiento en móvil (solo parámetros generales)
    mobile: {
      extraDelayFirstStep: 600,    // delay extra SOLO para el primer paso (ecosistema)
      enableServicesDemo: true,    // si es true se permite demo horizontal en 'servicios'
      servicesScrollCycles: 1,
      servicesScrollDuration: 280,
      servicesScrollBackFactor: 0.15,
      tabSwitchDelay: 400
    },

    // Secuencia de secciones del tour
    // Cada paso puede sobreescribir duración de scroll y delay
    steps: [
      {
        id: 'ecosistema',
        scrollDuration: 90,   // entra rápido a EVOAPP
        stepDelay: 900         // pequeña pausa
      },
      {
        id: 'servicios',
        scrollDuration: 2200,   // un poco más suave
        stepDelay: 2200,
        mobile: {
          runServicesDemo: true // aquí SÍ queremos el hint horizontal
        }
      },
      {
        id: 'referencias',
        scrollDuration: 900,
        stepDelay: 600
      },
      {
        id: 'reconocimientos',
        scrollDuration: 900,
        stepDelay: 600
      },
      {
        id: 'contacto',
        scrollDuration: 900,
        stepDelay: 600
      }
    ]
  };

  // ---------- ESTADO INTERNO ----------
  const tourBtn = document.getElementById('btn-tour');
  let isTourRunning = false;
  let tourAbortController = null;

  if (tourBtn) {
    tourBtn.addEventListener('click', runEvorixTour);
  }

  // ---------- FUNCIÓN PRINCIPAL ----------
  async function runEvorixTour() {
    if (isTourRunning) return;

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Si usuario prefiere menos animación -> sólo bajamos a Servicios
    if (prefersReducedMotion) {
      const target = document.getElementById('servicios');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    isTourRunning = true;
    tourAbortController = new AbortController();
    const { signal } = tourAbortController;

    document.body.classList.add('tour-active');

    // Permitir que el usuario corte el tour con interacción
    const stopTour = () => {
      if (!isTourRunning) return;
      isTourRunning = false;
      if (tourAbortController) tourAbortController.abort();
      document.body.classList.remove('tour-active');
      window.removeEventListener('wheel', stopTour);
      window.removeEventListener('touchstart', stopTour);
      window.removeEventListener('keydown', stopTour);
    };

    setTimeout(() => {
      window.addEventListener('wheel', stopTour, { passive: true });
      window.addEventListener('touchstart', stopTour, { passive: true });
      window.addEventListener('keydown', stopTour, { passive: true });
    }, 100);

    try {
      const isMobile =
        window.matchMedia &&
        window.matchMedia('(max-width: 768px)').matches;

      for (let i = 0; i < TOUR_CONFIG.steps.length; i++) {
        if (signal.aborted) break;

        const step = TOUR_CONFIG.steps[i];
        const element = document.getElementById(step.id);
        if (!element) continue;

        // 1) Duración de scroll para ESTE paso:
        const baseDuration =
          typeof step.scrollDuration === 'number'
            ? step.scrollDuration
            : (i === 0
              ? TOUR_CONFIG.firstScrollDuration
              : TOUR_CONFIG.scrollDuration);

        const offsetFactor = typeof step.offsetFactor === 'number' ? step.offsetFactor : null;

        // 2) Scroll hacia la sección
        await autoScrollTo(element, signal, baseDuration, offsetFactor);
        if (signal.aborted) break;

        // 3) Efecto visual
        highlightSection(element);
        spawnParticles(element);

        // 4) Comportamiento especial en Servicios (solo móvil)
        const shouldRunServicesDemo =
          isMobile &&
          step.id === 'servicios' &&
          TOUR_CONFIG.mobile.enableServicesDemo &&
          (!step.mobile || step.mobile.runServicesDemo !== false);

        if (shouldRunServicesDemo) {
          // Lo lanzamos en paralelo para no bloquear el flujo principal
          demoServicesSequence(signal).catch(() => { });
        }

        // 5) Delay después de cada sección
        const baseDelay =
          typeof step.stepDelay === 'number'
            ? step.stepDelay
            : TOUR_CONFIG.stepDelay;

        const extraMobile =
          isMobile && i === 0
            ? TOUR_CONFIG.mobile.extraDelayFirstStep
            : 0;

        await waitWithAbort(baseDelay + extraMobile, signal);
      }

      // Al final volvemos arriba (si no se abortó)
      if (!signal.aborted) {
        await autoScrollTo(document.body, signal, TOUR_CONFIG.scrollDuration);
      }
    } catch (e) {
      // ignoramos errores de aborto
    } finally {
      stopTour();
    }
  }




























  // ---------- HELPERS GENERALES ----------

  // Espera con soporte de abort
  function waitWithAbort(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Aborted'));
        return;
      }
      const id = setTimeout(() => {
        resolve();
      }, ms);
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(id);
          reject(new Error('Aborted'));
        },
        { once: true }
      );
    });
  }











  // Scroll suave respetando header y dejando aire arriba
  // element: sección destino
  // signal: AbortSignal del tour (opcional)
  // duration: duración en ms
  // customOffsetPx: (opcional) píxeles extra de margen arriba para este paso
  function autoScrollTo(element, signal, duration = 800, customOffsetPx = null) {
    // Hacemos el signal opcional y seguro
    const abortSignal =
      signal && typeof signal.aborted === "boolean" ? signal : null;

    return new Promise((resolve, reject) => {
      const startY = window.scrollY || window.pageYOffset;
      const rect = element.getBoundingClientRect();
      const viewportH =
        window.innerHeight || document.documentElement.clientHeight;

      const isMobile =
        window.matchMedia &&
        window.matchMedia("(max-width: 768px)").matches;

      // Margen base en pixeles (ajustable)
      const baseOffsetPx = isMobile ? 1 : 1;

      // Si algún paso envía un offset extra, lo sumamos
      const extraOffsetPx =
        typeof customOffsetPx === "number" ? customOffsetPx : 0;

      // Posición objetivo
      let targetY = rect.top + startY - (baseOffsetPx + extraOffsetPx);

      // Limitar dentro del documento
      const docH = document.documentElement.scrollHeight;
      const maxScroll = docH - viewportH;
      if (targetY < 0) targetY = 0;
      if (targetY > maxScroll) targetY = maxScroll;

      const startTime = performance.now();

      function step(now) {
        if (abortSignal && abortSignal.aborted) {
          reject(new Error("aborted"));
          return;
        }

        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        // easing suave (easeInOutQuad)
        const eased =
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const currentY = startY + (targetY - startY) * eased;
        window.scrollTo(0, currentY);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }



























  /*
    ---------------------------------------------------------------------------
    NOTA SOBRE EL CENTRADO DE SECCIONES (autoScrollTo):
    
    La función calcula la posición de scroll restando un porcentaje de la altura 
    de la ventana (viewport) a la posición superior del elemento.
    
    - 'offsetFactor' = Porcentaje de espacio libre que se deja ARRIBA del elemento.
    
    VALORES POR DEFECTO ACTUALES:
    - Mobile (~30%): offsetFactor = 0.30
    - Desktop (~18%): offsetFactor = 0.18
    
    CÓMO AJUSTAR:
    - Para que la sección quede MÁS ARRIBA: REDUCE el número (ej. 0.20).
    - Para que la sección quede MÁS ABAJO (más al centro): AUMENTA el número (ej. 0.40).
    
    Puedes personalizar esto por paso en TOUR_CONFIG añadiendo la propiedad:
    offsetFactor: 0.25 (por ejemplo).
    ---------------------------------------------------------------------------
  */

  // Marca el título de la sección un momento
  function highlightSection(section) {
    const title = section.querySelector('h2') || section.querySelector('h3');
    if (!title) return;

    title.classList.add('tour-highlight');
    setTimeout(() => title.classList.remove('tour-highlight'), 1000);
  }

  // Gancho para partículas locales (ahora desactivado)
  function spawnParticles(element) {
    // Aquí puedes reactivar tu lógica de partículas ligada a la sección
    // Ejemplo:
    // evorixParticles.spawnBurst(element.getBoundingClientRect());
  }

  // ---------- SECUENCIA ESPECÍFICA PARA SERVICIOS (MÓVIL) ----------

  async function demoServicesSequence(signal) {
    if (signal.aborted) return;
    await waitWithAbort(150, signal); // pequeña pausa de entrada

    await demoServicesTabSelection(signal);
    await demoServicesHorizontalScroll(signal);
  }

  // Scroll horizontal de la lista de servicios
  function demoServicesHorizontalScroll(signal) {
    return new Promise((resolve) => {
      const isMobile =
        window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      if (!isMobile) {
        resolve();
        return;
      }

      if (signal.aborted) {
        resolve();
        return;
      }


      const servicesList = document.querySelector(
        '.services-list[role="tablist"]'
      );
      if (!servicesList) {
        resolve();
        return;
      }

      const maxScroll = servicesList.scrollWidth - servicesList.clientWidth;
      if (maxScroll <= 0) {
        resolve();
        return;
      }

      const cycles = TOUR_CONFIG.mobile.servicesScrollCycles;
      const duration = TOUR_CONFIG.mobile.servicesScrollDuration;
      const backFactor = TOUR_CONFIG.mobile.servicesScrollBackFactor;

      let currentCycle = 0;

      const runCycle = () => {
        if (currentCycle >= cycles || signal.aborted) {
          resolve();
          return;
        }

        const targetScroll = Math.min(
          maxScroll,
          servicesList.clientWidth * 0.8
        );
        const start = servicesList.scrollLeft;
        const startTime = performance.now();

        function animate(now) {
          if (signal.aborted) {
            resolve();
            return;
          }

          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          const ease =
            t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          servicesList.scrollLeft =
            start + (targetScroll - start) * ease;

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            setTimeout(() => {
              servicesList.scrollTo({
                left: servicesList.scrollLeft * backFactor,
                behavior: 'smooth'
              });
              currentCycle++;
              // pausa corta entre ciclos
              setTimeout(runCycle, 200);
            }, 100);
          }
        }

        requestAnimationFrame(animate);
      };

      runCycle();
    });
  }

  // Secuencia de selección de tabs (Servicios)
  async function demoServicesTabSelection(signal) {
    const isMobile =
      window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    const servicesList = document.querySelector(
      '.services-list[role="tablist"]'
    );
    if (!servicesList) return;

    const tabs = servicesList.querySelectorAll('[role="tab"]');
    if (!tabs || tabs.length === 0) return;

    const delay = TOUR_CONFIG.mobile.tabSwitchDelay;

    // Tab 2
    if (tabs.length > 1) {
      await waitWithAbort(delay, signal);
      if (!signal.aborted) tabs[1].click();
    }

    // Tab 3
    if (tabs.length > 2) {
      await waitWithAbort(delay, signal);
      if (!signal.aborted) tabs[2].click();
    }

    // Volver a Tab 1
    if (tabs.length > 0) {
      await waitWithAbort(delay, signal);
      if (!signal.aborted) tabs[0].click();
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






