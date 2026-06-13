require("dotenv").config();
let express = require("express");
let path = require("path");
let app = express();
const methodOverride = require("method-override");
const session = require("express-session");
const crypto = require("crypto");
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// This is a trusted server-side app, so prefer the service role key: it bypasses
// Row Level Security so the backend can read/write the `user` table. The anon key
// is blocked by RLS (login returns 0 rows, register is rejected) — only used as a
// fallback if the service role key is not configured.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Razorpay credentials. Use TEST keys (rzp_test_...) for the demo — they accept
// Razorpay test cards and never charge real money. Get them from the Razorpay
// Dashboard (Test Mode) -> Settings -> API Keys.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Trust the reverse proxy so req.protocol reflects X-Forwarded-Proto (https)
app.set("trust proxy", true);

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

app.get('/', (req, res) => {
  res.redirect('/home');
});

// Site-wide favicon: browsers request /favicon.ico by default, so point it at
// the logo. This covers every page without editing each template's <head>.
app.get('/favicon.ico', (req, res) => {
  res.redirect(301, '/images/logo.png');
});

// Resolve the public-facing base URL (origin only): explicit override wins,
// otherwise auto-detect from the request (honours the proxy via "trust proxy"
// above). Any path in SITE_URL is dropped so paths can be appended cleanly.
function getBaseUrl(req) {
  if (process.env.SITE_URL) {
    try {
      return new URL(process.env.SITE_URL).origin;
    } catch {
      return process.env.SITE_URL.replace(/\/+$/, "");
    }
  }
  return `${req.protocol}://${req.get("host")}`;
}

app.get("/robots.txt", (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.type("text/plain").send(
`User-agent: *
Allow: /
Disallow: /login
Disallow: /cart
Disallow: /payment
Disallow: /checkout
Disallow: /logout

Sitemap: ${baseUrl}/sitemap.xml
`);
});

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const pages = [
    { path: "/home", changefreq: "weekly", priority: "1.0" },
    { path: "/menu", changefreq: "weekly", priority: "0.9" },
    { path: "/offers", changefreq: "weekly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.6" },
  ];
  const urls = pages.map((p) =>
`  <url>
    <loc>${baseUrl}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");
  res.type("application/xml").send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
});

app.get('/login', (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  email = (email || "").trim();
  password = (password || "").trim();
  try {
    let { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

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
  res.render("index.ejs", { user: req.session.user, baseUrl: getBaseUrl(req) });
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

    // Current per-dish quantities so the menu can render the stepper for items
    // already in the cart (instead of an ADD button).
    const cartQuantities = {};
    getCart(req).forEach(i => { cartQuantities[i.item_id] = i.quantity; });

    res.render("menu.ejs", { appetizers, mains, desserts, user: req.session.user, cartQuantities });
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

// ---- Cart (session-backed) ----

// Add a dish to the cart. Adding is allowed without logging in; the cart lives
// in the session and is preserved through login. Returns JSON for the menu's
// fetch-based ADD buttons.
app.post("/cart/add", async (req, res) => {
  const { item_id } = req.body;
  try {
    const { data: dish, error } = await supabase
      .from('menu')
      .select('item_id, name, price')
      .eq('item_id', item_id)
      .maybeSingle();

    if (error || !dish) {
      return res.status(404).json({ ok: false, error: "Dish not found" });
    }

    const cart = getCart(req);
    const existing = cart.find(i => String(i.item_id) === String(dish.item_id));
    let itemQuantity;
    if (existing) {
      existing.quantity += 1;
      itemQuantity = existing.quantity;
    } else {
      cart.push({ item_id: dish.item_id, name: dish.name, price: Number(dish.price), quantity: 1 });
      itemQuantity = 1;
    }

    res.json({ ok: true, count: cartCount(cart), itemQuantity, name: dish.name });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Decrement a dish by one (JSON, used by the menu stepper). Removes the line
// item when its quantity reaches zero.
app.post("/cart/decrement", (req, res) => {
  const { item_id } = req.body;
  const cart = getCart(req);
  const item = cart.find(i => String(i.item_id) === String(item_id));
  let itemQuantity = 0;
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      req.session.cart = cart.filter(i => String(i.item_id) !== String(item_id));
    } else {
      itemQuantity = item.quantity;
    }
  }
  res.json({ ok: true, count: cartCount(getCart(req)), itemQuantity });
});

// Lightweight count endpoint so the navbar badge can stay in sync.
app.get("/cart/count", (req, res) => {
  res.json({ count: cartCount(getCart(req)) });
});

app.get("/cart", isLoggedIn, (req, res) => {
  res.render("cart.ejs", { user: req.session.user, cartItems: getCart(req) });
});

// Increment / decrement a line item's quantity.
app.post("/cart/update/:id", isLoggedIn, (req, res) => {
  const cart = getCart(req);
  const item = cart.find(i => String(i.item_id) === String(req.params.id));
  if (item) {
    if (req.body.action === "inc") item.quantity += 1;
    else if (req.body.action === "dec") item.quantity = Math.max(1, item.quantity - 1);
  }
  res.redirect("/cart");
});

app.delete("/cart/remove/:id", isLoggedIn, (req, res) => {
  req.session.cart = getCart(req).filter(i => String(i.item_id) !== String(req.params.id));
  res.redirect("/cart");
});

app.post("/checkout", isLoggedIn, (req, res) => {
  if (getCart(req).length === 0) return res.redirect("/cart");
  res.redirect("/payment");
});

// ---- Payment (Razorpay test/demo) ----

app.get("/payment", isLoggedIn, (req, res) => {
  const cart = getCart(req);
  if (cart.length === 0) return res.redirect("/cart");
  res.render("payment.ejs", {
    user: req.session.user,
    cartItems: cart,
    total: cartTotal(cart),
    razorpayKey: RAZORPAY_KEY_ID || null,
  });
});

// Create a Razorpay order for the current cart (amount is sent in paise).
app.post("/payment/create-order", isLoggedIn, async (req, res) => {
  const cart = getCart(req);
  if (cart.length === 0) return res.status(400).json({ ok: false, error: "Cart is empty" });
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ ok: false, error: "Payment is not configured" });
  }

  try {
    const amount = cartTotal(cart) * 100; // rupees -> paise
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `rcpt_${req.session.user.user_id}_${Date.now()}`,
      }),
    });
    const order = await rzpRes.json();
    if (!rzpRes.ok) {
      return res.status(502).json({ ok: false, error: (order.error && order.error.description) || "Could not create order" });
    }
    res.json({ ok: true, key: RAZORPAY_KEY_ID, orderId: order.id, amount, currency: "INR" });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Could not start payment" });
  }
});

// Verify the Razorpay signature, then persist the order and clear the cart.
app.post("/payment/verify", isLoggedIn, async (req, res) => {
  if (!RAZORPAY_KEY_SECRET) return res.status(500).json({ ok: false, error: "Payment is not configured" });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Missing payment details" });
  }

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (expected !== razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Payment verification failed" });
  }

  try {
    const order = await persistOrder(req);
    if (!order) return res.status(400).json({ ok: false, error: "Cart is empty" });
    req.session.lastOrder = { orderId: order.order_id, total: order.total };
    res.json({ ok: true, redirect: "/payment/success" });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Could not save order" });
  }
});

// Order confirmation page. After a Razorpay payment it reads the just-placed
// order from the session; the demo fallback posts here directly.
app.get("/payment/success", isLoggedIn, (req, res) => {
  const last = req.session.lastOrder;
  if (!last) return res.redirect("/menu");
  delete req.session.lastOrder;
  res.render("order-success.ejs", { user: req.session.user, orderId: last.orderId, total: last.total });
});

// Demo fallback: only used when Razorpay keys are NOT configured.
app.post("/payment/success", isLoggedIn, async (req, res) => {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) return res.redirect("/payment");
  try {
    const order = await persistOrder(req);
    if (!order) return res.redirect("/cart");
    res.render("order-success.ejs", { user: req.session.user, orderId: order.order_id, total: order.total });
  } catch (err) {
    res.render("404.ejs");
  }
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

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

function cartCount(cart) {
  return cart.reduce((n, i) => n + i.quantity, 0);
}

function cartTotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

// Persist the current cart as an order (+ line items) and clear the cart.
// Returns { order_id, total }, or null if the cart is empty.
async function persistOrder(req) {
  const cart = getCart(req);
  if (cart.length === 0) return null;
  const total = cartTotal(cart);

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: req.session.user.user_id,
      total_amount: total,
      order_time: new Date().toISOString(),
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  const items = cart.map(i => ({
    order_id: order.order_id,
    menu_id: i.item_id,
    quantity: i.quantity,
    price: i.price,
  }));
  const { error: itemsErr } = await supabase.from('order_items').insert(items);
  if (itemsErr) throw itemsErr;

  req.session.cart = [];
  return { order_id: order.order_id, total };
}