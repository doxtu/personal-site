var express = require("express");
var app = express();
var mysql = require('mysql');
var url = require('url');

/* Getting all static files from this directory */
app.use(express.static("public"));
app.use("/icop",express.static("public/icop"));
app.use("/lcis",express.static("public/lcis"));

app.get("/lcis/payments",function dbs(req,res){
	let connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "Testy321!",
		database: "test"
	});
	let query = url.parse(req.url,true).query;
	
	connection.connect();
	
	connection.query("SELECT * FROM users",function(err,rows,fields){
		if(err) throw err;	
		res.status(200).send(rows);
	});
	
	connection.end();
	
});

app.post("/lcis/payments",function dbHandler(req,res){
	let connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "Testy321!",
		database: "test"
	});
	let query = url.parse(req.url,true).query;
	let type = Number(query.type);
	let amount = Number(query.amount);
	let date = Number(query.date);
	
	connection.connect();
	
	let sql = "INSERT INTO payments VALUES(" + null + "," + connection.escape(type) + "," + connection.escape(date) + "," + connection.escape(amount) + ")";
	console.log("\n\n\n\n\n"+sql);
	connection.query(sql,function(err,rows,fields){
		if(err) throw err;
		console.log(rows);
		res.status(200).send("OK");
	});
	
	connection.end();
});

/*set port to 80 when pushing to master*/
app.listen(8000);