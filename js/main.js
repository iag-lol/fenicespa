(function () {
  "use strict";

  /* ── Constantes ────────────────────────────────────────── */
  const WA_PHONE = "56939579658";
  const DEFAULT_SERVICE = "petroleo_domicilio";

  const SERVICE_MESSAGES = {
    petroleo_domicilio:
      "Hola, quiero solicitar petróleo a domicilio en la Región Metropolitana. Necesito información sobre disponibilidad y precios.",
    transporte_combustible:
      "Hola, necesito cotizar transporte de combustible. Quiero conocer cobertura en RM y alrededores, capacidad y tiempos de despacho.",
    instalacion_estanques:
      "Hola, quiero información sobre instalación de estanques certificados para combustible. ¿Pueden asesorarme?",
    general:
      "Hola, quiero cotizar petróleo a domicilio y despacho de combustible. Necesito información sobre cobertura y precios.",
  };

  /* ── Helpers WhatsApp ──────────────────────────────────── */
  function buildWaUrl(message) {
    return "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(message);
  }

  function getServiceMessage(key) {
    return SERVICE_MESSAGES[key] || SERVICE_MESSAGES.general;
  }

  function getInitialService() {
    const bodyService = document.body.dataset.defaultService;
    const queryService = new URLSearchParams(window.location.search).get("servicio");
    let remembered = "";
    try { remembered = sessionStorage.getItem("fenice_selected_service") || ""; } catch (_) {}
    return queryService || bodyService || remembered || DEFAULT_SERVICE;
  }

  function setWhatsappLinks(serviceKey) {
    const url = buildWaUrl(getServiceMessage(serviceKey));
    document.querySelectorAll(".js-wa-link").forEach(link => {
      link.setAttribute("href", url);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function bindServiceButtons() {
    document.querySelectorAll(".js-service-wa").forEach(btn => {
      const key = btn.dataset.service || DEFAULT_SERVICE;
      btn.setAttribute("href", buildWaUrl(getServiceMessage(key)));
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener noreferrer");
      btn.addEventListener("click", () => {
        try { sessionStorage.setItem("fenice_selected_service", key); } catch (_) {}
      });
    });
  }

  function bindDirectWhatsAppOpen() {
    document.querySelectorAll("a.js-wa-link, a.js-service-wa").forEach(link => {
      link.addEventListener("click", e => {
        const href = link.getAttribute("href") || "";
        if (!href.includes("wa.me/")) return;
        e.preventDefault();
        const popup = window.open(href, "_blank", "noopener,noreferrer");
        if (!popup) window.location.href = href;
      });
    });
  }

  function bindEmailLinks() {
    document.querySelectorAll("a.js-email-link").forEach(link => {
      link.addEventListener("click", e => {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("mailto:")) return;
        e.preventDefault();
        window.location.href = href;
      });
    });
  }

  /* ── Menú mobile ───────────────────────────────────────── */
  function bindMenuToggle() {
    const toggle = document.querySelector(".menu-toggle");
    const nav    = document.querySelector(".nav-links");
    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

    document.addEventListener("click", e => {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) closeMenu();
    });
  }

  /* ── Header compacto al hacer scroll ──────────────────── */
  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle("scrolled", window.scrollY > 28);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Animaciones fade-up al hacer scroll ───────────────── */
  function initScrollAnimations() {
    const els = document.querySelectorAll(".fade-up");
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add("is-visible"), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -44px 0px" });

    els.forEach(el => observer.observe(el));
  }

  /* ── Año dinámico en footer ────────────────────────────── */
  function setCurrentYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[id^="year-"]').forEach(el => (el.textContent = year));
  }

  /* ── FAQ tracking ──────────────────────────────────────── */
  function bindFaqTracking() {
    document.querySelectorAll("details").forEach(item => {
      item.addEventListener("toggle", () => {
        if (item.open) item.dataset.opened = "true";
      });
    });
  }

  /* ── Init ──────────────────────────────────────────────── */
  setWhatsappLinks(getInitialService());
  bindServiceButtons();
  bindDirectWhatsAppOpen();
  bindEmailLinks();
  bindMenuToggle();
  initHeaderScroll();
  initScrollAnimations();
  setCurrentYear();
  bindFaqTracking();
})();
