(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const startup = document.getElementById("startup-screen");
  const continueButton = document.getElementById("continue-button");
  const loadingWrap = document.getElementById("loading-wrap");
  const loadingBar = document.getElementById("loading-bar");
  const loadingPercent = document.getElementById("loading-percent");
  const startupDate = document.getElementById("startup-date");
  const header = document.getElementById("site-header");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const mobileLinks = document.querySelectorAll(".mobile-menu a");
  const themeButtons = document.querySelectorAll(".theme-toggle");
  const navLinks = document.querySelectorAll(".desktop-nav .nav-link");
  const sections = document.querySelectorAll("main section[id]");

  // Dynamic lock-screen date/time.
  const updateStartupDate = () => {
    const now = new Date();
    startupDate.textContent = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };
  updateStartupDate();

  // Startup sequence.
  let started = false;
  const startWebsite = () => {
    if (started) return;
    started = true;

    continueButton.disabled = true;
    continueButton.style.opacity = "0.45";
    loadingWrap.classList.add("active");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 700 : 1800;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const percent = Math.round(eased * 100);

      loadingBar.style.width = `${percent}%`;
      loadingPercent.textContent = `${percent}%`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          startup.classList.add("exit");
          body.classList.remove("locked");
          setTimeout(() => startup.remove(), 800);
        }, reducedMotion ? 50 : 300);
      }
    };

    requestAnimationFrame(tick);
  };

  continueButton.addEventListener("click", startWebsite);
  continueButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") startWebsite();
  });

  // Theme.
  const getSavedTheme = () => {
    try { return localStorage.getItem("shazin-theme"); } catch (_) { return null; }
  };

  const updateThemeButtons = () => {
    const isDark = root.dataset.theme === "dark";
    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      const label = button.querySelector(".theme-label");
      if (label) label.textContent = isDark ? "Light" : "Dark";
    });
  };

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem("shazin-theme", theme); } catch (_) {}
    updateThemeButtons();
  };

  if (getSavedTheme()) setTheme(getSavedTheme());
  updateThemeButtons();

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  });

  // Header state.
  const setHeaderState = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  // Mobile menu.
  const openMenu = () => {
    mobileMenu.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    body.classList.add("menu-open");
  };

  const closeMenu = () => {
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.contains("open") ? closeMenu() : openMenu();
  });
  menuClose.addEventListener("click", closeMenu);
  mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("open")) closeMenu();
  });

  // Reveal animations.
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  // Active navigation.
  const setActiveNav = () => {
    let current = "home";
    const marker = window.scrollY + window.innerHeight * 0.35;

    sections.forEach((section) => {
      if (marker >= section.offsetTop) current = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };

  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });

  // Clicking the top SHAZIN name always returns to home.
  document.querySelector(".brand").addEventListener("click", () => {
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Custom cursor on desktop.
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (finePointer && !reducedMotion) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      body.classList.add("cursor-ready");
    }, { passive: true });

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll("a, button").forEach((element) => {
      element.addEventListener("mouseenter", () => body.classList.add("cursor-hover"));
      element.addEventListener("mouseleave", () => body.classList.remove("cursor-hover"));
    });
  }
})();
