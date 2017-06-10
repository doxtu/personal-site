const connection = require("./db");
const bcrypt = require("bcrypt");
const url = require('url');

module.exports = (function exe(){
    var api = {};

    api.authenticate =   function(user, pass, done) {
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
    };

    //reads data from DB
    api.read = function(req,res){
    	let query = url.parse(req.url,true).query;
    	let month = query.month;

    	if(!month) return;

    	let sql0 = "SELECT payments.type,payments.amount FROM payments WHERE payments.month = " + month;

    	connection.query(sql0,function(err,rows,fields){
    		if(err) {res.status(500).send("QUERY FAILED"); return;}
    		res.status(200).send(rows);
    	});
    };

    //adds data to db
    api.create = function(req,res){
    	let query = req.body;
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
    };

    api.delete = function(req,res){
    	let query = req.body;
    	let type = Number(query.type);
    	let amount = Number(query.amount);
    	let month = Number(query.month);

    	//sql queries
    	//first verify that the payment to delete exists, and then delete it;
    	let sql0 = "SELECT * FROM payments WHERE type = ? AND amount = ? AND month = ?";
    	let sql1 = "DELETE FROM payments WHERE type = ? AND month = ? AND amount = ?";

    	//payments
    	let found = false;

    	new Promise(function(s,f){
    		connection.query(sql0,[type,amount,month],function(err,rows,fields){
    			if (err) f();
    			if(rows && rows.length > 0) found = true;
    			s();
    		});
    	})
    	.then(function(){
    		if(found){
    			connection.query(sql1,[type,month,amount],function(err,rows,fields){
    				if(err) throw err;
    				res.status(200).send("RECORD DELETED");
    			});
    		}else{
    			res.status(400).send("CANNOT FIND RECORD");
    		}
    	})
    	.catch(function(){
    		res.status(500).send("SERVER ERROR");
    	});
    };

    api.update = function(req,res){
    	let query = req.body;
    	let type = Number(query.type);
    	let amount = Number(query.amount);
    	let month = Number(query.month);

    	let sql0 = "SELECT * FROM payments WHERE payments.type = ? AND payments.month = ?";
    	let sql1 = "UPDATE payments SET payments.amount = ? WHERE payments.type = ? AND payments.month = ?";

    	let found = false;

    	new Promise(function(s,f){
    		connection.query(sql0,[type,month],function(err,rows,fields){
    			if (err) f();
    			if(rows.length > 0) found = true;
    			s();
    		});
    	})
    	.then(function(){
    		if(found){
    			connection.query(sql1,[amount,type,month],function(err,rows,fields){
    				if(err) throw err;
    				res.status(200).send("RECORD DELETED");
    			});
    		}else{
    			res.status(400).send("CANNOT FIND RECORD");
    		}
    	})
    	.catch(function(){
    		res.status(500).send("SERVER ERROR");
    	});
    };

    return api;
})();
