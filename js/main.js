(function () {
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
      "Hola, quiero cotizar petróleo a domicilio y despacho de combustible. Necesito información sobre cobertura y precios."
  };

  function buildWaUrl(message) {
    return "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(message);
  }

  function getServiceMessage(serviceKey) {
    return SERVICE_MESSAGES[serviceKey] || SERVICE_MESSAGES.general;
  }

  function getInitialService() {
    // Priority: explicit URL service > page default > last selected service.
    const bodyService = document.body.dataset.defaultService;
    const query = new URLSearchParams(window.location.search);
    const queryService = query.get("servicio");
    let remembered = "";

    try {
      remembered = sessionStorage.getItem("fenice_selected_service") || "";
    } catch (err) {
      remembered = "";
    }

    return queryService || bodyService || remembered || DEFAULT_SERVICE;
  }

  function setWhatsappLinks(serviceKey) {
    const message = getServiceMessage(serviceKey);
    const url = buildWaUrl(message);
    const links = document.querySelectorAll(".js-wa-link");

    links.forEach((link) => {
      link.setAttribute("href", url);
      link.setAttribute("aria-label", "Solicitar por WhatsApp: " + message);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function bindServiceButtons() {
    // Service buttons override message so each click opens a tailored WhatsApp text.
    const serviceButtons = document.querySelectorAll(".js-service-wa");

    serviceButtons.forEach((btn) => {
      const serviceKey = btn.dataset.service || DEFAULT_SERVICE;
      const serviceUrl = buildWaUrl(getServiceMessage(serviceKey));

      btn.setAttribute("href", serviceUrl);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener noreferrer");
      btn.addEventListener("click", () => {
        try {
          sessionStorage.setItem("fenice_selected_service", serviceKey);
        } catch (err) {
          // Ignore storage limitations; link still works via href.
        }
      });
    });
  }

  function bindDirectWhatsAppOpen() {
    const links = document.querySelectorAll("a.js-wa-link, a.js-service-wa");

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href") || "";
        if (!href.includes("wa.me/")) {
          return;
        }

        event.preventDefault();
        const popup = window.open(href, "_blank", "noopener,noreferrer");
        if (!popup) {
          window.location.href = href;
        }
      });
    });
  }

  function bindMenuToggle() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindFaqTracking() {
    const faqItems = document.querySelectorAll("details");
    faqItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) {
          item.dataset.opened = "true";
        }
      });
    });
  }

  function setCurrentYear() {
    const yearNodes = document.querySelectorAll('[id^="year-"]');
    const currentYear = String(new Date().getFullYear());
    yearNodes.forEach((node) => {
      node.textContent = currentYear;
    });
  }

  const serviceKey = getInitialService();
  setWhatsappLinks(serviceKey);
  bindServiceButtons();
  bindDirectWhatsAppOpen();
  bindMenuToggle();
  bindFaqTracking();
  setCurrentYear();
})();
