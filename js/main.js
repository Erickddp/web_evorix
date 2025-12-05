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
  // 2. HEADER SCROLL BEHAVIOR
  // =========================================
  const header = document.querySelector('header.site');
  let lastScrollY = window.scrollY;

  if (header) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const isMenuOpen = document.getElementById('mobile-menu')?.getAttribute('aria-hidden') === 'false';

      // Hide header on scroll down, show on scroll up (only if menu is closed)
      if (!isMenuOpen && currentScrollY > lastScrollY && currentScrollY > 100) {
        header.classList.add('hide');
      } else {
        header.classList.remove('hide');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
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
  // 6. EVORIX PARTICLE ENGINE (ENHANCED)
  // =========================================
  (function () {
    const canvas = document.getElementById('evorix-canvas');
    if (!canvas) {
      console.error('EVORIX: canvas not found');
      return;
    }
    const ctx = canvas.getContext('2d');

    // CONFIG: increased density (~30-40% more)
    const PARTICLES_DESKTOP = 1800;  // was 1400
    const PARTICLES_MOBILE = 1000;   // was 800
    const BASE_SPEED = 0.14;         // slightly faster
    const EXTRA_SPEED = 0.50;        // slightly faster

    let width = 0;
    let height = 0;
    let particles = [];

    // State for ghost EVORIX
    let canvasState = 'free';        // 'free' | 'evorixGhost'
    let evorixStartTime = null;
    let evorixPoints = [];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED + Math.random() * EXTRA_SPEED;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.r = 0.7 + Math.random() * 1.6;
        this.alpha = 0.35 + Math.random() * 0.55;
        // Ghost formation props
        this.inEvorix = false;
        this.targetX = null;
        this.targetY = null;
      }
    }

    function targetCount() {
      return (window.innerWidth >= 1024)
        ? PARTICLES_DESKTOP
        : PARTICLES_MOBILE;
    }

    function rebuildParticles() {
      const desired = targetCount();
      particles = [];
      for (let i = 0; i < desired; i++) {
        particles.push(new Particle());
      }
    }

    function buildEvorixPoints() {
      const off = document.createElement('canvas');
      const textWidth = 420;
      const textHeight = 110;
      off.width = textWidth;
      off.height = textHeight;

      const octx = off.getContext('2d');
      octx.clearRect(0, 0, textWidth, textHeight);
      octx.fillStyle = '#ffffff';
      octx.font = 'bold 80px system-ui, -apple-system, BlinkMacSystemFont';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText('EVORIX', textWidth / 2, textHeight / 2);

      const data = octx.getImageData(0, 0, textWidth, textHeight).data;
      const pts = [];
      for (let y = 0; y < textHeight; y += 5) {
        for (let x = 0; x < textWidth; x += 5) {
          const idx = (y * textWidth + x) * 4 + 3;
          if (data[idx] > 160) {
            pts.push({ x, y });
          }
        }
      }

      // center horizontally, place around ~1.3 viewport heights (between sections)
      const baseX = (width - textWidth) / 2;
      const baseY = window.innerHeight * 1.25;
      evorixPoints = pts.map(p => ({
        x: baseX + p.x,
        y: baseY + p.y
      }));
    }

    function resizeCanvas() {
      width = window.innerWidth;
      height = Math.max(
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      canvas.width = width;
      canvas.height = height;
      rebuildParticles();
      buildEvorixPoints();
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    resizeCanvas();

    // Pointer attraction
    let pointerX = null;
    let pointerY = null;
    function setPointer(e) {
      const touch = e.touches ? e.touches[0] : e;
      pointerX = touch.clientX;
      pointerY = touch.clientY + window.scrollY;
    }
    function clearPointer() {
      pointerX = pointerY = null;
    }
    window.addEventListener('mousemove', setPointer);
    window.addEventListener('touchstart', setPointer, { passive: true });
    window.addEventListener('touchmove', setPointer, { passive: true });
    window.addEventListener('touchend', clearPointer);
    window.addEventListener('touchcancel', clearPointer);

    // Ghost EVORIX state management
    function setCanvasState(next) {
      if (canvasState === next) return;
      canvasState = next;
      if (next === 'evorixGhost') {
        evorixStartTime = performance.now();
        assignEvorixTargets();
      } else {
        evorixStartTime = null;
        releaseEvorixTargets();
      }
    }

    function assignEvorixTargets() {
      if (!evorixPoints.length) buildEvorixPoints();
      const max = Math.min(evorixPoints.length, Math.floor(particles.length * 0.5));
      for (let i = 0; i < max; i++) {
        const p = particles[i];
        const t = evorixPoints[i];
        p.inEvorix = true;
        p.targetX = t.x;
        p.targetY = t.y;
      }
    }

    function releaseEvorixTargets() {
      particles.forEach(p => {
        if (p.inEvorix) {
          p.inEvorix = false;
          p.targetX = null;
          p.targetY = null;
        }
      });
    }

    function updateScrollState() {
      const about = document.querySelector('#sobre-mi');
      const services = document.querySelector('#servicios');
      if (!about || !services) {
        setCanvasState('free');
        return;
      }

      const rectA = about.getBoundingClientRect();
      const rectS = services.getBoundingClientRect();
      const vh = window.innerHeight;

      const zoneCenter = (rectA.bottom + rectS.top) / 2;

      // Trigger zone roughly between Sobre mí and Servicios
      if (zoneCenter > vh * 0.2 && zoneCenter < vh * 0.8) {
        setCanvasState('evorixGhost');
      } else {
        setCanvasState('free');
      }
    }

    window.addEventListener('scroll', updateScrollState);
    updateScrollState();

    function updateParticle(p) {
      if (canvasState === 'evorixGhost' && p.inEvorix && p.targetX != null) {
        // smooth attraction to target (ghost formation)
        p.x += (p.targetX - p.x) * 0.12;
        p.y += (p.targetY - p.y) * 0.12;
      } else {
        // normal free movement
        p.x += p.vx;
        p.y += p.vy;

        // pointer attraction (increased visibility)
        if (pointerX != null && pointerY != null) {
          const dx = pointerX - p.x;
          const dy = pointerY - p.y;
          const dist2 = dx * dx + dy * dy;
          const maxDist = 260;
          if (dist2 < maxDist * maxDist) {
            const force = 0.0016;  // increased from 0.0009 for more visible effect
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }

        // wrap / respawn
        if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
          p.reset();
        }
      }
    }

    function drawParticle(p) {
      let alpha = p.alpha;
      if (canvasState === 'evorixGhost' && p.inEvorix) {
        alpha *= 0.55; // softer, ghosty
      }
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#1d4ed8'; // EVORIX blue
      ctx.fill();
    }

    function ensureParticles() {
      const desired = targetCount();
      if (particles.length !== desired) rebuildParticles();
    }

    function animate() {
      // IMPORTANT: first line to guarantee continuous loop
      requestAnimationFrame(animate);

      ensureParticles();

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        updateParticle(p);
        drawParticle(p);
      });

      // Auto dissolve ghost after ~2 seconds
      if (canvasState === 'evorixGhost' && evorixStartTime) {
        const elapsed = performance.now() - evorixStartTime;
        if (elapsed > 2000) {
          setCanvasState('free');
        }
      }
    }

    console.log('EVORIX: enhanced particle engine started (1800/1000 particles, ghost mode enabled)');
    animate();
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
  // 10. MOBILE NAVIGATION
  // =========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      toggleMobileMenu(!isExpanded);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });

    function toggleMobileMenu(show) {
      mobileMenu.setAttribute('aria-hidden', !show);
      mobileMenuBtn.setAttribute('aria-expanded', show);

      // Update icon (hamburger <-> close)
      if (show) {
        mobileMenuBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      } else {
        mobileMenuBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `;
        document.body.style.overflow = '';
      }
    }
  }

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
    const rect = element.getBoundingClientRect();
    // Use fixed position relative to viewport
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3; // Adjust for scroll if using fixed, but rect.top is viewport relative

    // Actually rect.top is relative to viewport, so for fixed elements it's fine.
    // But wait, rect.top changes as we scroll.
    // We are stopped when we spawn particles, so rect.top is correct.

    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'tour-particle';
      // Random spread around center
      const x = centerX + (Math.random() - 0.5) * 300;
      const y = rect.top + 50 + (Math.random() - 0.5) * 100; // Near top of section

      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.animationDelay = `${Math.random() * 0.3}s`;

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
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
