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

      // Hide header on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
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
  // 6. HERO ANIMATION SYSTEM (Canvas)
  // =========================================
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let isFormationMode = false;
    let formationTargets = [];

    // Configuration
    const GRID_SIZE = 40;
    const FORMATION_TEXT = "EVORIX";
    const BASE_PARTICLE_COUNT = window.innerWidth < 768 ? 80 : 250; // Dynamic count

    let gridColor = '255, 255, 255';

    function updateCanvasColors() {
      const theme = document.documentElement.getAttribute('data-theme');
      gridColor = theme === 'light' ? '15, 23, 42' : '255, 255, 255';
    }
    updateCanvasColors();
    window.addEventListener('theme-changed', updateCanvasColors);

    // Resize Handler
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Re-calculate targets if in formation mode to ensure text fits
      if (isFormationMode) {
        calculateFormationTargets();
      } else {
        initParticles(BASE_PARTICLE_COUNT);
      }
    }
    window.addEventListener('resize', resize);

    // Mouse Handler
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Particle Class
    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 1.5; // Slightly uniform size for text
        this.baseAlpha = Math.random() * 0.3 + 0.1;
        this.alpha = this.baseAlpha;

        // Target properties
        this.targetX = null;
        this.targetY = null;
        this.isDocked = false;

        // Idle motion offsets
        this.idleOffset = Math.random() * 100;
        this.idleSpeed = 0.002 + Math.random() * 0.002;
      }

      update(time) {
        if (isFormationMode && this.targetX !== null) {
          // Formation Mode: Seek target with easing
          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;

          // Spring-like easing
          this.x += dx * 0.08;
          this.y += dy * 0.08;

          // Idle motion when close to target (breathing effect)
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            this.isDocked = true;
          }

          if (this.isDocked) {
            // Subtle float around the target point
            this.x = this.targetX + Math.sin(time * this.idleSpeed + this.idleOffset) * 2;
            this.y = this.targetY + Math.cos(time * this.idleSpeed + this.idleOffset) * 2;
          }

          this.alpha = 0.9; // High visibility for text
        } else {
          // Floating Mode
          this.isDocked = false;
          this.x += this.vx;
          this.y += this.vy;

          // Mouse Attraction
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            this.x += dx * 0.03;
            this.y += dy * 0.03;
            this.alpha = Math.min(this.baseAlpha + 0.5, 1);
          } else {
            this.alpha = this.baseAlpha;
          }

          // Wrap around screen
          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;
          if (this.y < 0) this.y = height;
          if (this.y > height) this.y = 0;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(0, 102, 255, ${this.alpha})`; // Primary Blue
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize Particles
    function initParticles(count) {
      // Only add/remove if count changes significantly to avoid reset
      if (particles.length < count) {
        const diff = count - particles.length;
        for (let i = 0; i < diff; i++) particles.push(new Particle());
      } else if (particles.length > count) {
        particles.splice(count);
      }
    }

    // Calculate Text Formation Targets
    function calculateFormationTargets() {
      // 1. Setup offscreen canvas
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = width;
      tempCanvas.height = height;

      // 2. Font configuration
      // Responsive font size: 15vw but capped between 60px and 200px
      const fontSize = Math.max(60, Math.min(width * 0.18, 220));
      tempCtx.font = `900 ${fontSize}px "Manrope", sans-serif`; // Extra bold
      tempCtx.fillStyle = 'white';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      // 3. Draw text
      tempCtx.fillText(FORMATION_TEXT, width / 2, height / 2);

      // 4. Sample points
      const imageData = tempCtx.getImageData(0, 0, width, height).data;
      formationTargets = [];

      // Adaptive sampling step based on screen size
      // Smaller step = more points = sharper text
      const step = window.innerWidth < 768 ? 5 : 4;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          // Threshold > 128 ensures we only take the core of the letter
          if (imageData[index + 3] > 128) {
            formationTargets.push({ x, y });
          }
        }
      }

      // 5. Adjust particle count to match targets
      // We need exactly enough particles to fill the text
      const targetCount = formationTargets.length;

      // Add particles if we need more
      if (particles.length < targetCount) {
        const diff = targetCount - particles.length;
        for (let i = 0; i < diff; i++) {
          // Spawn new particles off-screen or random
          particles.push(new Particle(Math.random() * width, Math.random() * height));
        }
      }

      // Assign targets
      // Shuffle targets for random fill effect
      const shuffledTargets = [...formationTargets].sort(() => Math.random() - 0.5);

      particles.forEach((p, i) => {
        if (i < shuffledTargets.length) {
          p.targetX = shuffledTargets[i].x;
          p.targetY = shuffledTargets[i].y;
        } else {
          // Extra particles float away or fade
          p.targetX = null;
          p.targetY = null;
          p.alpha = 0; // Hide extras
        }
      });
    }

    // Draw Breathing Grid
    function drawGrid() {
      const time = Date.now() * 0.001;
      const breathe = Math.sin(time * 0.5) * 0.05 + 0.08;

      ctx.strokeStyle = `rgba(${gridColor}, ${breathe})`;
      ctx.lineWidth = 1;

      const moveY = (time * 10) % GRID_SIZE;

      for (let x = 0; x < width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = moveY; y < height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Animation Loop
    function animate() {
      const time = Date.now();
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Grid (Background) - Fade out in formation mode
      if (!isFormationMode) {
        drawGrid();
      }

      // 2. Update & Draw Particles
      particles.forEach(p => {
        p.update(time);
        // Only draw if visible
        if (p.alpha > 0.01) p.draw();
      });

      requestAnimationFrame(animate);
    }

    // Scroll Trigger for Formation
    const formationTrigger = document.getElementById('formation-trigger');
    if (formationTrigger) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!isFormationMode) {
              isFormationMode = true;
              calculateFormationTargets();
            }
          } else {
            if (isFormationMode) {
              isFormationMode = false;
              // Reset particles to float
              // Reduce count back to base if needed, or just let them float
              // Ideally we trim the array back to BASE_PARTICLE_COUNT slowly, but for now just release them
              particles.forEach(p => {
                p.targetX = null;
                p.targetY = null;
                p.vx = (Math.random() - 0.5) * 1;
                p.vy = (Math.random() - 0.5) * 1;
                p.alpha = p.baseAlpha;
              });
            }
          }
        });
      }, { threshold: 0.2 });

      observer.observe(formationTrigger);
    }

    // =========================================
    // 7. SERVICES SELECTOR SYSTEM
    // =========================================
    // =========================================
    // 7. SERVICES SELECTOR SYSTEM
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

      // Initial state for animation handled in CSS or here
      // Let's ensure they start hidden via JS or CSS. 
      // Since we didn't add specific hidden CSS for pills in the previous step (only hover/active),
      // we might want to add a class or just rely on the reveal class if we added it.
      // The user asked for "Left aligned...". 
      // Let's just keep it simple. If we want animation, we should set initial state.
      // For now, I'll assume the CSS handles the transition and I just trigger it if needed.
      // Actually, let's just observe it.
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

    // Start
    resize();
    animate();
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
  // 11. RECOGNITIONS ACCORDION (Mobile)
  // =========================================
  const accordionCards = document.querySelectorAll('.accordion-card');

  accordionCards.forEach(card => {
    const header = card.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', (e) => {
        // Prevent default if it's a link (though it's a div/header here)
        e.preventDefault();

        const isOpen = card.classList.contains('open');

        // Close others (Accordion behavior)
        accordionCards.forEach(c => {
          if (c !== card) c.classList.remove('open');
        });

        // Toggle current
        if (isOpen) {
          card.classList.remove('open');
        } else {
          card.classList.add('open');
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

})();
