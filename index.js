let express = require("express");
let path = require("path");
let app = express();

let port = 8080;

app.use(express.static(path.join(__dirname, "/public/CSS")));
app.use(express.static(path.join(__dirname, "/public/JS")));
app.use(express.static(path.join(__dirname, "/public/images")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


app.get('/', (req, res)=>{
    res.render("login.ejs");
});
app.get("/home", (req, res)=>{
    res.render("index.ejs");
});
app.get("/menu", (req, res)=>{
    res.render("menu.ejs");
});
app.get("/about", (req, res)=>{
    res.render("about.ejs");
});
app.get("/cart", (req, res)=>{
    res.render("cart.ejs");
});
app.get("/contact", (req, res)=>{
    res.render("contact.ejs");
});
app.get("/payment", (req, res)=>{
    res.render("payment.ejs");
});
// app.get("*", (req, res) => {
//     res.render("index.ejs");
// });

app.listen(port, ()=>{
    console.log(`App is Listening on Port ${port}`);
});