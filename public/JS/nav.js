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

// Cart count badge: exposed globally so menu.js can refresh it after adding,
// and refreshed on every page load so the count is always current.
window.updateCartBadge = function (count) {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count;
        badge.title = count + (count === 1 ? " item" : " items") + " in cart";
        badge.hidden = false;
    } else {
        badge.textContent = "";
        badge.removeAttribute("title");
        badge.hidden = true;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    fetch("/cart/count")
        .then((res) => res.json())
        .then((data) => window.updateCartBadge(data.count))
        .catch(() => {});
});
