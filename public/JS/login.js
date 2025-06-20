const container = document.getElementById("container");
const registerbtn = document.getElementById("register");
const loginbtn = document.getElementById("login");

registerbtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginbtn.addEventListener("click", () => {
  container.classList.remove("active");
});

document.querySelector(".sign-up form").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = event.target[0].value;
  const email = event.target[1].value;
  const password = event.target[2].value;

  if (name && email && password) {
    const userData = { name, email, password };
    localStorage.setItem("user", JSON.stringify(userData));
    alert("Registration successful! You can now log in.");
    event.target.reset(); 
  } else {
    alert("Please fill in all fields!");
  }
});

document.querySelector(".sign-in form").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = event.target[0].value;
  const password = event.target[1].value;

  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser && storedUser.email === email && storedUser.password === password) {
    alert(`Welcome, ${storedUser.name}! Login successful.`);
    window.location.href = "/home";
  } else {
    alert("Invalid email or password. Please try again.");
  }
});