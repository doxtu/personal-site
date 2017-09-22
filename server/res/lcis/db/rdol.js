/*INITIALIZE READ ONLY USER FOR LCIS*/

require("dotenv").config({path:"./../../.env"});
var connection = require("./db");
var bcrypt = require('bcrypt');
const saltRounds = 8;

var user = "rdol";
var pass = "password";
var hash = bcrypt.hashSync(pass,saltRounds);

connection.query("INSERT INTO users VALUES(NULL,?,?)",[user,hash],function(err,rows,fields){
    if(err) throw err;
    console.log("RDOL USER ADDED");
    process.exit();
});
