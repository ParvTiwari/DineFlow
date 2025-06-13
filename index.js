let express = require("express");
let app = express();

let port = 8080;
app.listen(port, ()=>{
    console.log(`App is Listening on Port ${port}`);
});