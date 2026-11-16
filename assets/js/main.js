"use strict";

document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");
const mobileLayout = window.matchMedia("(max-width: 900px)");

if (menuToggle && navigation) {
  menuToggle.hidden = false;

  const setMenuOpen = (open, restoreFocus = false) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.querySelector(".menu-toggle-label").textContent = open ? "Close" : "Menu";
    navigation.classList.toggle("is-open", open);
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link || !mobileLayout.matches) return;
    setMenuOpen(false);
    // Move focus into the chosen section before hiding its navigation link.
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false, true);
    }
  });

  document.addEventListener("click", (event) => {
    if (mobileLayout.matches && !event.target.closest(".site-header")) setMenuOpen(false);
  });

  mobileLayout.addEventListener("change", () => setMenuOpen(false));
}

// Keep section navigation in sync without adding scroll event handlers.
if ("IntersectionObserver" in window && navigation) {
  const navigationLinks = [...navigation.querySelectorAll("a[href^='#']")];
  const visibleSections = new Map();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.boundingClientRect.top);
      else visibleSections.delete(entry.target.id);
    }
    const sortedSections = [...visibleSections].sort((first, second) => first[1] - second[1]);
    const activeId = sortedSections.length ? sortedSections[0][0] : null;
    if (!activeId) return;
    for (const link of navigationLinks) {
      if (link.getAttribute("href") === `#${activeId}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }, { rootMargin: "-100px 0px -45% 0px", threshold: 0 });

  for (const link of navigationLinks) {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) observer.observe(section);
  }
}

const year = document.querySelector("#copyright-year");
if (year) year.textContent = String(new Date().getFullYear());
