// ===================================================================
// SPLASH / INTRO
// ===================================================================
(function () {
  const splash = document.getElementById("splash");
  const parallax = document.getElementById("splashParallax");
  const img = parallax.querySelector(".splash-img");
  const content = document.querySelector(".splash-content");
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const AUTO_HIDE_MS = 3400;   // tiempo hasta la transición automática
  const ZOOM_DURATION = 3400;  // duración del avance hacia la entrada
  const ZOOM_TARGET = isTouch ? 1.18 : 1.4;   // cuánto se acerca la foto (menos en móvil)
  const PUNCH_SCALE = isTouch ? 1.35 : 1.85;  // empujón final al "cruzar la puerta"

  let hidden = false;
  let rafId = null;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  const startTime = performance.now();

  document.body.style.overflow = "hidden";

  // Parallax 3D suave del fondo siguiendo el ratón (desactivado en táctil)
  if (!isTouch && !reduceMotion) {
    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
    });
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Avance continuo hacia la entrada: la foto se acerca poco a poco (efecto "caminar hacia la puerta")
  function raf(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / ZOOM_DURATION, 1);
    const scale = reduceMotion ? 1 : 1 + easeInOutQuad(t) * (ZOOM_TARGET - 1);

    if (!isTouch && !reduceMotion) {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
    }

    img.style.transform = `scale(${scale}) translate(${currentX * -24}px, ${currentY * -16}px)`;
    content.style.transform = `translate(${currentX * -10}px, ${currentY * -8}px)`;

    if (!hidden) rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  function hideSplash() {
    if (hidden) return;
    hidden = true;
    clearTimeout(autoTimer);
    if (rafId) cancelAnimationFrame(rafId);

    // Empujón final: cruzar el umbral de la puerta con un zoom rápido + luz, y disolver hacia la página principal
    img.style.transition = "transform 0.65s cubic-bezier(.4,0,.2,1), filter 0.65s ease";
    img.style.transform = `scale(${PUNCH_SCALE})`;
    img.style.filter = "brightness(1.3)";

    splash.classList.add("splash-hide");
    document.body.style.overflow = "";
    setTimeout(() => splash.remove(), 750);
  }

  // Saltar intro con click o cualquier tecla
  splash.addEventListener("click", hideSplash);
  window.addEventListener("keydown", hideSplash, { once: true });

  // Transición automática
  const autoTimer = setTimeout(hideSplash, AUTO_HIDE_MS);
})();

// ===================================================================
// HEADER: sombra al hacer scroll + menú móvil
// ===================================================================
(function () {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 12);
  });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open);
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
})();

// ===================================================================
// GSAP SCROLLTRIGGER: reveal de secciones al hacer scroll
// ===================================================================
(function () {
  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const groups = [
    ".hero-copy .reveal",
    ".hero-visual.reveal",
    ".services-grid .service-card",
    ".about-visual.reveal, .about-copy .reveal",
    ".testimonials-grid .testimonial-card",
    ".contact-copy .reveal, .contact-info.reveal",
  ];

  groups.forEach((selector) => {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;

    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: els[0].closest("section") || els[0],
        start: "top 80%",
        once: true,
      },
    });
  });
})();

// ===================================================================
// FORMULARIO DE CONTACTO (demo, sin backend)
// ===================================================================
(function () {
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    note.textContent = "¡Gracias! Te contactaremos en menos de 24h para confirmar tu cita.";
    form.reset();
  });
})();
