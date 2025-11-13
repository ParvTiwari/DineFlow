require("dotenv").config();
let express = require("express");
let path = require("path");
let app = express();
const methodOverride = require("method-override");
const session = require("express-session");
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

let port = process.env.PORT;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/public/CSS")));
app.use(express.static(path.join(__dirname, "/public/JS")));
app.use(express.static(path.join(__dirname, "/public/images")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get('/login', (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  try {
    let { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) {
      return res.send("Invalid credentials");
    }

    req.session.user = user;
    res.redirect("/menu");
  } catch (err) {
    res.render("404.ejs");
  }
});

app.post("/register", async (req, res) => {
  let { name, email, number, password } = req.body;
  try {
    let { error } = await supabase
      .from('user')
      .insert({ name, email, phone: number, password });

    if (error) throw error;

    res.redirect("/login");
  } catch (err) {
    res.render("404.ejs");
  }
});

app.get("/home", (req, res) => {
  res.render("index.ejs", { user: req.session.user });
});

app.post("/home/review", async (req, res) => {
  let { name, email, number, feedback } = req.body;
  try {
    let { error } = await supabase
      .from('reviews')
      .insert({ name, email, number, comment: feedback });

    if (error) throw error;

    res.redirect("/home");
  } catch (err) {
    res.render("404.ejs");
  }
});

app.get("/menu", async (req, res) => {
  try {
    let { data: results, error } = await supabase.from('menu').select('*');
    if (error) throw error;

    const appetizers = results.filter(dish => dish.category === 'Appetizer');
    const mains = results.filter(dish => dish.category === 'Main Course');
    const desserts = results.filter(dish => dish.category === 'Dessert');

    res.render("menu.ejs", { appetizers, mains, desserts, user: req.session.user });
  } catch (err) {
    res.render("404.ejs");
  }
});

app.get("/about", async (req, res) => {
  try {
    let { data: results, error } = await supabase.from('about').select('*');
    if (error) throw error;

    res.render("about.ejs", { results, user: req.session.user });
  } catch (err) {
    res.render("404.ejs");
  }
});

app.get("/offers", (req, res) => {
  res.render("offers.ejs", { user: req.session.user });
});

app.get("/cart", isLoggedIn, (req, res) => {
  res.render("cart.ejs", { user: req.session.user });
});

app.get("/payment", isLoggedIn, (req, res) => {
  res.render("payment.ejs");
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Logout Error");
    res.redirect("/login");
  });
});

app.get(/.*/, (req, res) => {
  res.render("404.ejs");
});

app.listen(port, () => {
  console.log(`App is Listening on Port http://localhost:${port}/home`);
});

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}