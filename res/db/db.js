var mysql = require('mysql');
var dotenv = require("dotenv/config");
module.exports = (function(){
	let connection = mysql.createConnection({
		host: process.env.DBHOST,
		user: process.env.DBUSER,
		password: process.env.DBPASS,
		database: process.env.DBNAME
		//uncomment this when pushing prod
		// socketPath:'/var/run/mysqld/mysqld.sock'
	});
	
	connection.connect();
	
	return connection;
})();
