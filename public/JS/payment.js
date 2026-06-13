// Razorpay checkout flow (test mode). Creates an order on the server, opens the
// Razorpay popup, then verifies the signature server-side before confirming.
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("rzpBtn");
    if (!btn || typeof Razorpay === "undefined") return;

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
            const orderRes = await fetch("/payment/create-order", { method: "POST" });
            const order = await orderRes.json();
            if (!order.ok) {
                alert(order.error || "Could not start payment");
                btn.disabled = false;
                return;
            }

            const rzp = new Razorpay({
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "DineFlow",
                description: "Order Payment",
                order_id: order.orderId,
                theme: { color: "#ff9900" },
                prefill: {
                    name: btn.dataset.name || "",
                    email: btn.dataset.email || "",
                    contact: btn.dataset.phone || "",
                },
                handler: async (response) => {
                    try {
                        const verifyRes = await fetch("/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: new URLSearchParams(response),
                        });
                        const result = await verifyRes.json();
                        if (result.ok) {
                            window.location.href = result.redirect;
                        } else {
                            alert(result.error || "Payment verification failed");
                            btn.disabled = false;
                        }
                    } catch (err) {
                        alert("Payment verification failed");
                        btn.disabled = false;
                    }
                },
                modal: {
                    ondismiss: () => { btn.disabled = false; },
                },
            });

            rzp.on("payment.failed", (resp) => {
                alert("Payment failed: " + (resp.error && resp.error.description));
                btn.disabled = false;
            });

            rzp.open();
        } catch (err) {
            alert("Could not start payment");
            btn.disabled = false;
        }
    });
});
