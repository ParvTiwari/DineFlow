const container = document.getElementById("container");
const registerbtn = document.getElementById("register");
const loginbtn = document.getElementById("login");

registerbtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginbtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// document.querySelector(".sign-up form").addEventListener("submit", (event) => {
//   event.preventDefault();

//   const name = event.target[0].value;
//   const email = event.target[1].value;
//   const password = event.target[2].value;

//   if (name && email && password) {
//     const userData = { name, email, password };
//     localStorage.setItem("user", JSON.stringify(userData));
//     alert("Registration successful! You can now log in.");
//     event.target.reset(); 
//   } else {
//     alert("Please fill in all fields!");
//   }
// });

// document.querySelector(".sign-in form").addEventListener("submit", (event) => {
//   event.preventDefault();
  
//   const email = event.target[0].value;
//   const password = event.target[1].value;
  
//   const storedUser = JSON.parse(localStorage.getItem("user"));
  
//   if (storedUser && storedUser.email === email && storedUser.password === password) {
//     alert(`Welcome, ${storedUser.name}! Login successful.`);
//     window.location.href = "/home";
//   } else {
//     alert("Invalid email or password. Please try again.");
//   }
// });

function validateSignup() {
  const name = document.querySelector('input[placeholder="Name"]').value.trim();
  const email = document.querySelector('input[placeholder="Email"]').value.trim();
  const number = document.querySelector('input[placeholder="Mobile Number"]').value.trim();
  const password = document.querySelector('input[placeholder="Password"]').value.trim();

  if (!name || !email || !number || !password) {
    alert("Please fill all the fields.");
    return false;
  }

  if (!/^[6-9][0-9]{9}$/.test(number)) {
    alert("Please enter a valid 10-digit mobile number starting with 6-9.");
    return false;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  }
  alert("Registration successful! You can now log in.");
  return true;
}