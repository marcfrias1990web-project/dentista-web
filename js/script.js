// ===================================================================
// SPLASH / INTRO
// ===================================================================
(function () {
  const splash = document.getElementById("splash");
  const doors = document.getElementById("splashDoors");
  const content = document.querySelector(".splash-content");
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const AUTO_HIDE_MS = 3400;    // tiempo hasta la transición automática
  const ZOOM_DURATION = 3400;   // duración del avance hacia la puerta
  const ZOOM_TARGET = isTouch ? 1.16 : 1.35;  // cuánto se acerca la foto (menos en móvil)
  const DOOR_OPEN_MS = 1900;    // duración del giro de apertura de las puertas, lento y suave

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

  // Avance continuo hacia la entrada: ambas hojas de la puerta se acercan juntas, como una sola foto
  function raf(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / ZOOM_DURATION, 1);
    const scale = reduceMotion ? 1 : 1 + easeInOutQuad(t) * (ZOOM_TARGET - 1);

    if (!isTouch && !reduceMotion) {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
    }

    doors.style.transform = `scale(${scale}) translate(${currentX * -24}px, ${currentY * -16}px)`;
    content.style.transform = `translate(${currentX * -10}px, ${currentY * -8}px)`;

    if (!hidden) rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  function hideSplash() {
    if (hidden) return;
    hidden = true;
    clearTimeout(autoTimer);
    if (rafId) cancelAnimationFrame(rafId);

    splash.style.pointerEvents = "none";
    splash.classList.add("splash-hide");     // funde el texto y el velo oscuro, y enciende el resplandor cálido
    doors.classList.add("doors-open");       // las dos hojas giran despacio sobre su bisagra y se abren
    document.body.classList.add("entering"); // la página se acomoda suavemente al entrar
    document.body.style.overflow = "";

    // Avisa al resto de la página para que se revele mientras las puertas terminan de abrirse
    window.dispatchEvent(new CustomEvent("splash:done"));

    setTimeout(() => splash.remove(), reduceMotion ? 50 : DOOR_OPEN_MS + 150);
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

  // El Hero se revela en cuanto las puertas de la intro terminan de abrirse, no al hacer scroll
  function revealHero() {
    const els = gsap.utils.toArray(".hero-copy .reveal, .hero-visual.reveal");
    if (!els.length) return;
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: "power2.out",
      stagger: 0.16,
      delay: 0.15,
    });
  }
  window.addEventListener("splash:done", revealHero, { once: true });
  // Si la intro ya no existe (JS desactivado en ella, o recarga con #), revela igualmente
  if (!document.getElementById("splash")) revealHero();

  const groups = [
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
// MODAL DE SERVICIO
// ===================================================================
(function () {
  const modal = document.getElementById("serviceModal");
  if (!modal) return;

  const titleEl = document.getElementById("serviceModalTitle");
  const descEl = document.getElementById("serviceModalDesc");
  const listEl = document.getElementById("serviceModalList");
  const iconEl = document.getElementById("serviceModalIcon");
  const cards = document.querySelectorAll(".service-card[data-service]");

  const SERVICES = {
    blanqueamiento: {
      title: "Blanqueamiento dental",
      desc: "Un tratamiento seguro e indoloro que aclara el color natural de tus dientes, eliminando las manchas acumuladas por café, té, tabaco o el paso del tiempo.",
      points: [
        "Aclara hasta 6 tonos en una única sesión de 45 minutos",
        "Técnica LED de baja sensibilidad, apta para dientes sensibles",
        "Revisión previa para descartar caries u otras afecciones",
        "Resultados duraderos con el mantenimiento adecuado",
      ],
    },
    ortodoncia: {
      title: "Ortodoncia",
      desc: "Corregimos la posición de tus dientes y tu mordida con la técnica que mejor se adapte a tu caso: desde brackets tradicionales hasta alineadores prácticamente invisibles.",
      points: [
        "Brackets metálicos, estéticos o alineadores transparentes",
        "Estudio digital en 3D antes de empezar el tratamiento",
        "Revisiones mensuales para ajustar el plan a tu evolución",
        "Planes de financiación adaptados a la duración del tratamiento",
      ],
    },
    implantes: {
      title: "Implantes dentales",
      desc: "Sustituimos piezas dentales perdidas por implantes de titanio biocompatibles, devolviendo la función y la estética de tu sonrisa de forma definitiva.",
      points: [
        "Materiales biocompatibles de alta durabilidad",
        "Planificación guiada por escáner 3D de baja radiación",
        "Anestesia local con protocolo de máximo confort",
        "Seguimiento post-operatorio incluido durante el primer año",
      ],
    },
    revisiones: {
      title: "Revisiones periódicas",
      desc: "Un chequeo completo para detectar a tiempo caries, problemas de encías o desgaste, y mantener tu boca sana durante todo el año.",
      points: [
        "Exploración completa y limpieza profesional",
        "Diagnóstico digital con fotografías intraorales",
        "Recomendaciones personalizadas de higiene diaria",
        "Recordatorio automático para tu próxima revisión",
      ],
    },
  };

  let lastFocused = null;

  function openService(card) {
    const data = SERVICES[card.dataset.service];
    if (!data) return;

    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    listEl.innerHTML = data.points.map((point) => `<li>${point}</li>`).join("");
    const icon = card.querySelector(".service-icon");
    iconEl.innerHTML = icon ? icon.innerHTML : "";

    lastFocused = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".service-modal-close").focus();
  }

  function closeService() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openService(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openService(card);
      }
    });
  });

  modal.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeService)
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeService();
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
