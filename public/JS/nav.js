// Mobile navbar toggle: shows/hides the collapsed nav menu on small screens.
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
        const open = menu.classList.toggle("show");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Collapse the menu after following a link on mobile.
    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => menu.classList.remove("show"));
    });
});
