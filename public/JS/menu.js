// Menu cart controls. Each dish has a ".cart-control" wrapper that shows either
// an ADD button or a "− qty +" stepper. Clicking ADD / + adds to the cart;
// clicking − decrements (and reverts to ADD at zero). Uses event delegation so
// it keeps working after the wrapper's markup is swapped.
document.addEventListener("click", async (e) => {
    const wrapper = e.target.closest(".cart-control");
    if (!wrapper) return;

    const itemId = wrapper.dataset.id;
    const name = wrapper.dataset.name || "Item";
    if (!itemId) return;

    let endpoint = null;
    let isAdd = false;
    if (e.target.classList.contains("add-btn") || e.target.classList.contains("step-inc")) {
        endpoint = "/cart/add";
        isAdd = e.target.classList.contains("add-btn");
    } else if (e.target.classList.contains("step-dec")) {
        endpoint = "/cart/decrement";
    } else {
        return;
    }

    setWrapperBusy(wrapper, true);
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ item_id: itemId }),
        });
        const data = await res.json();

        if (data.ok) {
            renderControl(wrapper, data.itemQuantity);
            if (typeof window.updateCartBadge === "function") {
                window.updateCartBadge(data.count);
            }
            if (isAdd) showToast(`${name} added to cart`);
        } else {
            showToast(data.error || "Could not update cart");
        }
    } catch (err) {
        showToast("Network error — please try again");
    } finally {
        setWrapperBusy(wrapper, false);
    }
});

// Swap a control between the ADD button and the quantity stepper.
function renderControl(wrapper, qty) {
    if (qty > 0) {
        wrapper.innerHTML =
            '<div class="qty-stepper">' +
            '<button type="button" class="step-dec" aria-label="Decrease quantity">−</button>' +
            '<span class="step-qty">' + qty + '</span>' +
            '<button type="button" class="step-inc" aria-label="Increase quantity">+</button>' +
            '</div>';
    } else {
        wrapper.innerHTML = '<button type="button" class="add-btn">ADD</button>';
    }
}

function setWrapperBusy(wrapper, busy) {
    wrapper.querySelectorAll("button").forEach((b) => { b.disabled = busy; });
}

// Minimal self-contained toast (no extra CSS file required).
function showToast(message) {
    let toast = document.getElementById("cart-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cart-toast";
        toast.style.cssText =
            "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
            "background:#262626;color:#fff;padding:12px 20px;border-radius:8px;" +
            "font-family:sans-serif;font-size:14px;z-index:9999;opacity:0;" +
            "transition:opacity .25s ease;box-shadow:0 4px 12px rgba(0,0,0,.25);";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => { toast.style.opacity = "1"; });
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.style.opacity = "0"; }, 1800);
}
