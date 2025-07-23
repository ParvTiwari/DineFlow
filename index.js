let express = require("express");
let path = require("path");
let app = express();
const mysql = require("mysql2");
const methodOverride = require("method-override");
const session = require("express-session");

// Session setup
app.use(session({
  secret: "dineflow_parv_tiwari",
  resave: false,
  saveUninitialized: false
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'dineflow',
  password: 'mysql@123'
});

let port = 8080;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/public/CSS")));
app.use(express.static(path.join(__dirname, "/public/JS")));
app.use(express.static(path.join(__dirname, "/public/images")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


app.get('/login', (req, res)=>{
    res.render("login.ejs");
});
app.post("/login", (req, res)=>{
    let {email, password} = req.body;
    let q = `SELECT * FROM user WHERE email = ? AND password = ?`;
    try{
        connection.query(q, [email, password], (err, result)=>{
            if (err) throw err;
            if (result.length == 1) {
                req.session.user = result[0];
                res.redirect("/menu");
            } else {
                res.send("Invalid credentials");
            }
        });
    } catch (err){
        res.render("404.ejs");
    }
});
app.post("/register", (req, res)=>{
    let {name, email, number, password} = req.body;
    let q = `INSERT INTO user (name, email, phone, password) VALUES (?, ?, ?, ?)`;
    try{
        connection.query(q, [name, email, number, password], (err, result)=>{
            res.redirect("/login");
        });
    } catch (err){
        res.render("404.ejs");
    }
});

app.get("/home", (req, res)=>{
    res.render("index.ejs", { user: req.session.user });
});
app.post("/home/review", (req, res)=>{
    let {name, email, number, feedback} = req.body;
    let q = `INSERT INTO reviews (name, email, number, comment) VALUES (?, ?, ?, ?)`;
    try{
        connection.query(q, [name, email, number, feedback], (err, result)=>{
            if(err) throw err;
            res.redirect("/home");
        });
    } catch(err){
        res.render("404.ejs");
    }
});
app.get("/menu", (req, res)=>{
    let q = `SELECT * FROM menu`;
    try{
        connection.query(q, (err, results)=>{
            const appetizers = results.filter(dish => dish.category === 'Appetizer');
            const mains = results.filter(dish => dish.category === 'Main Course');
            const desserts = results.filter(dish => dish.category === 'Dessert');
            res.render("menu.ejs", {appetizers, mains, desserts, user: req.session.user});
        });
    } catch(err){
        res.render("404.ejs");
    }
});
app.get("/about", (req, res)=>{
    let q = `SELECT * FROM about`;
    try{
        connection.query(q, (err, results)=>{
            res.render("about.ejs", {results, user: req.session.user});
        });
    } catch(err){
        res.render("404.ejs");
    }
});
app.get("/offers", (req, res)=>{
    res.render("offers.ejs", {user: req.session.user});
});
app.get("/cart", isLoggedIn, (req, res)=>{
    res.render("cart.ejs", {user: req.session.user});
});
app.get("/payment", isLoggedIn, (req, res)=>{
    res.render("payment.ejs");
});
app.post("/logout", (req, res)=>{
    req.session.destroy((err)=>{
        if(err) return res.send("Logout Error");
        res.redirect("/login");
    });
});
app.get(/.*/, (req, res) => {
    res.render("404.ejs");
});

app.listen(port, ()=>{
    console.log(`App is Listening on Port ${port}`);
});

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}