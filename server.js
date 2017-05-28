var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var multer = require("multer");
var mysql = require('mysql');
var url = require('url');
var passport = require('passport');
var BasicStrategy = require('passport-local').Strategy;


/* Getting all static files from this directory */
app.use(express.static("public"));
app.use("/icop",express.static("public/icop"));
app.use("/lcis",express.static("public/lcis"));

/*Authentication middleware for LCIS*/
app.use(passport.initialize());

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.get("/lcis/login",passport.authenticate('local',{successRedirect:"/lcis",failureRedirect:"/lcis/login",failureFlash:true});

app.get("/lcis/payments",function dbs(req,res){
	let connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "Testy321!",
		database: "test"
	});
	
	let query = url.parse(req.url,true).query;
	let month = query.month;
	
	if(!month) return;
	
	let sql0 = "SELECT payments.type,payments.amount FROM payments WHERE payments.month = " + month;
	
	connection.connect();
	
	connection.query(sql0,function(err,rows,fields){
		if(err) {res.status(500).send("QUERY FAILED"); return;}	
		res.status(200).send(rows);
	});
	
	connection.end();
	
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//Adding a payment to the database
app.post("/lcis/payments",function dbHandler(req,res){
	let connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "Testy321!",
		database: "test"
	});
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
		connection.connect();
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
					connection.end();
					res.status(200).send("OK");
				});
			}else{
				res.status(400).send("RECORD ALREADY EXISTS");
			}
		})
		.catch(function(){
			connection.end();
			res.status(500).send("SERVER ERROR");
		});
	}
});

/*set port to 80 when pushing to master*/
app.listen(8000);