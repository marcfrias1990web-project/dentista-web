// ===================================================================
// SPLASH / INTRO
// ===================================================================
(function () {
  const splash = document.getElementById("splash");
  const parallax = document.getElementById("splashParallax");
  const content = document.querySelector(".splash-content");
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let hidden = false;
  let autoTimer = null;

  function hideSplash() {
    if (hidden) return;
    hidden = true;
    clearTimeout(autoTimer);
    splash.classList.add("splash-hide");
    document.body.style.overflow = "";
    splash.addEventListener("transitionend", () => splash.remove(), { once: true });
    setTimeout(() => splash.remove(), 800);
  }

  document.body.style.overflow = "hidden";

  // Parallax 3D suave del fondo siguiendo el ratón (desactivado en táctil/reduced-motion)
  if (!isTouch && !reduceMotion) {
    const img = parallax.querySelector(".splash-img");
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    window.addEventListener("mousemove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx;
      targetY = ny;
    });

    function raf() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      img.style.transform = `scale(1.15) translate(${currentX * -30}px, ${currentY * -20}px)`;
      content.style.transform = `translate(${currentX * -10}px, ${currentY * -8}px)`;

      if (!hidden) requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Saltar intro con click o cualquier tecla
  splash.addEventListener("click", hideSplash);
  window.addEventListener("keydown", hideSplash, { once: true });

  // Transición automática tras 3s
  autoTimer = setTimeout(hideSplash, 3000);
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
