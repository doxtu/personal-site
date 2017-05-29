var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var multer = require("multer");
var mysql = require('mysql');
var url = require('url');
var passport = require('passport');
var session = require("express-session");
var LocalStrategy = require('passport-local').Strategy;
var connection = require("./res/db/db");
var bcrypt = require("bcrypt");
const saltRounds = 8;

/*Middleware*/
app.use(express.static("public"));
app.use("/icop",express.static("public/icop"));
app.use("/lcis",express.static("public/lcis"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
// app.use(passport.session());

/*Authentication middleware for LCIS*/
passport.use(new LocalStrategy({
	usernameField: "user",
	passwordField: "pass"
},
  function(user, pass, done) {
	user = user.toLowerCase();
	pass = pass.toLowerCase();
    connection.query("SELECT users.name,users.auth_string FROM users WHERE users.name = ?", [user],function(err,rows,fields){
		if(rows && rows.length == 0){return done(null,false);}
		bcrypt.compare(pass,rows[0].auth_string,function(err,res){
			if(err) throw err;
			if(res){
				return done(null,rows[0].name);
			}else{
				return done(null,false);
			}
		});
	});
}));


app.post('/lcis/login',passport.authenticate("local",{session:false}),function(req,res){
	res.status(200).send("Good job!");
}); 

  
app.get("/lcis/payments",function dbs(req,res){
	let query = url.parse(req.url,true).query;
	let month = query.month;
	
	if(!month) return;
	
	let sql0 = "SELECT payments.type,payments.amount FROM payments WHERE payments.month = " + month;
	
	connection.query(sql0,function(err,rows,fields){
		if(err) {res.status(500).send("QUERY FAILED"); return;}	
		res.status(200).send(rows);
	});
});

//Adding a payment to the database
app.post("/lcis/payments",function dbHandler(req,res){
	let query = req.body;
	// let query = url.parse(req.params,true).query;
	let type = Number(query.type);
	let amount = Number(query.amount);
	let month = Number(query.month);
	
	//queries
	let sql0 = "SELECT types.code FROM types";
	let sql1 = "SELECT payments.month,payments.type FROM payments";
	let sql2 = "INSERT INTO payments VALUES(" + null + "," + connection.escape(type) + "," + connection.escape(month) + "," + connection.escape(amount) + ")";
	
	//check if the submitted info exists in the tables and reject if it already exists.
	{
		//two flags for the sql queries to determine if the submitted info already exists
		let found = false;
		let exist = false;
		
		//preconditions to failure
		let conditions = (month < 1 || month > 12);
		
		Promise.all([
			new Promise(function(s,f){
				//Does the submitted code exist?
				connection.query(sql0,function(err,rows,fields){
					if(err) f();
					exist = rows.reduce(function(acc,row){
						return (row.code == type) || acc;
					},exist);
					s();
				});
			}),
			new Promise(function(s,f){
				//Does the submitted month and type exist in the payments db?
				connection.query(sql1,function(err,rows,fields){
					if(err) f();
					rows.forEach(function querySearch(row){
						if((row.month == month && row.type == type) && type != 2229)
							found = true;
					});
					s();
				});	
			})
		])
		.then(function(){
			if(!found && exist && !conditions){	
				connection.query(sql2,function(err,rows,fields){
					if(err) return res.status(500).send("SERVER ERROR");
					res.status(200).send("OK");
				});
			}else{
				res.status(400).send("RECORD ALREADY EXISTS");
			}
		})
		.catch(function(){
			res.status(500).send("SERVER ERROR");
		});
	}
});

/*set port to 80 when pushing to master*/
app.listen(80);
