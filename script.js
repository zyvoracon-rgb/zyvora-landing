const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const year = document.querySelector("[data-year]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const faqButtons = document.querySelectorAll(".faq-question");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImg = document.querySelector("[data-lightbox-img]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const workflowPreviewButtons = document.querySelectorAll("[data-lightbox-image]");
const trackedClicks = document.querySelectorAll(".track-click");

window.dataLayer = window.dataLayer || [];

if (year) {
  year.textContent = new Date().getFullYear();
}

const closeMenu = () => {
  if (!navToggle || !navMenu) return;

  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";

    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });
}

const updateHeader = () => {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const animateCounter = (counter) => {
  const target = Number(counter.dataset.counter || 0);
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    counter.textContent = Math.round(target * eased).toString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.55 }
);

counters.forEach((counter) => counterObserver.observe(counter));

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const isOpen = button.getAttribute("aria-expanded") === "true";

    faqButtons.forEach((otherButton) => {
      const otherAnswer = otherButton.nextElementSibling;

      otherButton.setAttribute("aria-expanded", "false");

      if (otherAnswer) {
        otherAnswer.style.maxHeight = "0";
      }
    });

    if (!isOpen && answer) {
      button.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      window.dataLayer.push({ event: "faq_open", question: button.innerText.trim() });
    }
  });
});

workflowPreviewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = button.dataset.lightboxImage || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  });
});

const closeLightbox = () => {
  if (!lightbox || !lightboxImg) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  document.body.classList.remove("lightbox-open");
};

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

trackedClicks.forEach((item) => {
  item.addEventListener("click", () => {
    window.dataLayer.push({ event: item.dataset.event || "cta_click" });
  });
});

const scrollMarks = [25, 50, 75, 100];
const sentMarks = new Set();

window.addEventListener(
  "scroll",
  () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    const depth = Math.round((window.scrollY / maxScroll) * 100);

    scrollMarks.forEach((mark) => {
      if (depth >= mark && !sentMarks.has(mark)) {
        sentMarks.add(mark);
        window.dataLayer.push({ event: "scroll_depth", depth: mark });
      }
    });
  },
  { passive: true }
);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeLightbox();
  }
});