document.getElementById('payBtn').onclick = function (e) {
    var options = {
        key: "rzp_live_aVKraUuMvOwNAS",
        amount: 100, // Amount in paise (₹500)
        currency: "INR",
        name: "DineFlow",
        description: "Test Transaction",
        image: "images/logo.png",
        handler: function (response){
            alert("Payment ID: " + response.razorpay_payment_id);
            // You can send this to your backend for verification
        },
        prefill: {
            name: "Test User",
            email: "parvtiwari1@gmail.com",
            contact: "9285121000"
        },
        notes: {
            address: "Test College Project"
        },
        theme: {
            color: "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
}