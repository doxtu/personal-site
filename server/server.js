const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require("dotenv").config({path:path.join(__dirname,"../.env")});
const query = require("./res/lcis/db/query");
const bcrypt = require("bcrypt");
const hillary = require("./res/email");
const saltRounds = 8;
const port = process.env.PORT || 8080;
const sport = process.env.SPORT || 8443;
const certPath = process.env.CERTPATH || "";

//Init express
var app = express();

//https stuff
const creds = {
    key:fs.readFileSync(certPath + "privkey.pem"),
    cert: fs.readFileSync(certPath + "fullchain.pem")
};


/*Middleware*/
app.all("*",function(req,res,next){
    if(req.protocol === "http") res.redirect("https://gonzaleslabs.com" + req.url);
    next();
});
app.use(express.static(path.join(__dirname,"../public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(require('helmet')());

/*LCIS Login authentication*/
passport.use(new LocalStrategy({
    usernameField: "user",
    passwordField: "pass"
}, query.authenticate));

app.post('/lcis/login',passport.authenticate("local",{session:false}),function(req,res){
    res.status(200).send("Good job!");
});

/*Message handler*/
app.post("/message",hillary());

/*LCIS DB Middleware*/
app.get("/lcis/payments",query.read);
app.post("/lcis/payments",query.create);
app.delete("/lcis/payments",query.delete);
app.put("/lcis/payments",query.update);
app.get("/lcis/types",query.type);

//app.listen(port);
const httpServ = http.createServer(app);
const httpsServ = https.createServer(creds,app);

httpServ.listen(port);
httpsServ.listen(sport);
