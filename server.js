var express = require("express");
var app = express();
var mysql = require('mysql');

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
	
	connection.connect();
	
	connection.query("SELECT * FROM users",function(err,rows,fields){
		if(err) throw err;
		
		res.send(rows[0].user_id,rows[0].name);
	});
	
});

/*set port to 80 when pushing to master*/
app.listen(8000);