var express = require("express");
var app = express();
var mysql = require('mysql');

/* Getting all static files from this directory */
app.use(express.static("public"));
app.use("/icop",express.static("res/static/icop"));

app.get("/mysql",function dbs(req,res){
	let connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "Testy321!",
		database: "test"
	});
	
	connection.connect();
	
	connection.query("SELECT * FROM kimmy",function(err,rows,fields){
		if(err) throw err;
		
		res.send(rows[0].id,rows[0].name,rows[0].song);
	});
	
});

/*set port to 80 when pushing to master*/
app.listen(8000);