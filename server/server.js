const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require("dotenv").config({path:path.join(__dirname,"../.env")});
const query = require("./res/lcis/db/query");
const bcrypt = require("bcrypt");
const hillary = require("./res/email");
const saltRounds = 8;
const port = process.env.PORT || 8000;

//Init express
var app = express();

/*Middleware*/
app.use(express.static(path.join(__dirname,"../public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());

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

app.listen(port);
