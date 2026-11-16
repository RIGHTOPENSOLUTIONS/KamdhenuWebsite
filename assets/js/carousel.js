"use strict";

(() => {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const indicators = [...carousel.querySelectorAll("[data-carousel-index]")];
  const controls = carousel.querySelector("[data-carousel-controls]");
  const rotationButton = carousel.querySelector("[data-carousel-rotation]");
  const announcement = carousel.querySelector("[data-carousel-announcement]");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const swipeArea = carousel.querySelector("[data-carousel-slides]");
  let current = 0;
  let rotationRequested = !motion.matches;
  let hovered = false;
  let onScreen = true;
  let timer = null;
  let touchStart = null;
  let pointerRotationIntent = null;

  controls.hidden = false;
  carousel.tabIndex = 0;

  // Reserve the tallest slide at the current width so controls never jump on rotation.
  function reserveSlideHeight() {
    let tallest = 0;
    slides.forEach((slide) => {
      const wasHidden = slide.hidden;
      slide.hidden = false;
      tallest = Math.max(tallest, slide.getBoundingClientRect().height);
      slide.hidden = wasHidden;
    });
    swipeArea.style.height = Math.ceil(tallest) + "px";
  }
  reserveSlideHeight();
  let resizeFrame = null;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(reserveSlideHeight);
  });

  function schedule() {
    window.clearTimeout(timer);
    timer = null;
    const label = rotationRequested ? "Pause" : "Play";
    rotationButton.querySelector("[data-carousel-rotation-label]").textContent = label;
    rotationButton.querySelector("[data-carousel-rotation-icon]").textContent = rotationRequested ? "Ⅱ" : "▷";
    rotationButton.setAttribute("aria-label", rotationRequested ? "Pause automatic slides" : "Start automatic slides");
    if (rotationRequested && !hovered && onScreen && !document.hidden) {
      timer = window.setTimeout(() => showSlide(current + 1, false), 5000);
    }
  }

  function showSlide(index, manual) {
    const next = (index + slides.length) % slides.length;
    const focusWasInSlide = slides[current].contains(document.activeElement);
    if (manual) rotationRequested = false;
    slides.forEach((slide, slideIndex) => {
      slide.hidden = slideIndex !== next;
      slide.classList.toggle("is-entering", slideIndex === next);
    });
    indicators.forEach((indicator, indicatorIndex) => {
      if (indicatorIndex === next) indicator.setAttribute("aria-current", "true");
      else indicator.removeAttribute("aria-current");
    });
    current = next;
    carousel.querySelector("[data-carousel-current]").textContent = ("0" + (current + 1)).slice(-2);
    if (manual) announcement.textContent = "Slide " + slides[current].getAttribute("aria-label");
    if (focusWasInSlide) carousel.focus({ preventScroll: true });
    schedule();
  }

  carousel.querySelector("[data-carousel-previous]").addEventListener("click", () => showSlide(current - 1, true));
  carousel.querySelector("[data-carousel-next]").addEventListener("click", () => showSlide(current + 1, true));
  indicators.forEach((button, index) => button.addEventListener("click", () => showSlide(index, true)));
  rotationButton.addEventListener("pointerdown", () => { pointerRotationIntent = !rotationRequested; });
  rotationButton.addEventListener("pointercancel", () => { pointerRotationIntent = null; });
  rotationButton.addEventListener("click", () => {
    rotationRequested = pointerRotationIntent === null ? !rotationRequested : pointerRotationIntent;
    pointerRotationIntent = null;
    schedule();
  });
  carousel.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const targets = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (Object.prototype.hasOwnProperty.call(targets, event.key)) {
      event.preventDefault();
      showSlide(targets[event.key], true);
    }
  });

  // Focus stops rotation until the visitor explicitly presses Play.
  carousel.addEventListener("focusin", () => {
    rotationRequested = false;
    schedule();
  });
  carousel.addEventListener("mouseenter", () => { hovered = true; schedule(); });
  carousel.addEventListener("mouseleave", () => { hovered = false; schedule(); });
  document.addEventListener("visibilitychange", schedule);
  motion.addEventListener("change", () => {
    if (motion.matches) rotationRequested = false;
    schedule();
  });

  swipeArea.addEventListener("touchstart", (event) => {
    rotationRequested = false;
    schedule();
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  swipeArea.addEventListener("touchend", (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) showSlide(current + (deltaX < 0 ? 1 : -1), true);
  }, { passive: true });
  swipeArea.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      schedule();
    }, { threshold: .15 });
    observer.observe(carousel);
  }
  schedule();
})();
