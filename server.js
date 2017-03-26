var express = require("express");
var mime = require("mime");
var app = express();
var fs = require("fs");

function getStatic(path){
	return function(req,res){
		var type = mime.lookup(path);
		var body = fs.createReadStream(path);
		res.writeHead(200,{"content-type":type});
		if(body){
			body.pipe(res);
		}
	}
}

app.get("/",getStatic("./index.html"));
app.get("/main.css",getStatic("./main.css"));
app.get("/normalize.css",getStatic("./normalize.css"));
app.get("/res/twitter.gif",getStatic("./res/twitter.gif"));
app.get("/res/codepen.png",getStatic("./res/codepen.png"));
app.get("/res/github.png",getStatic("./res/github.png"));
app.get("/res/github.png",getStatic("./res/github.png"));
app.get("/res/ee.png",getStatic("./res/ee.png"));
app.get("/res/hearthbot.png",getStatic("./res/hearthbot.png"));
app.get("/res/icop.png",getStatic("./res/icop.png"));

app.listen(8000);