var express = require("express");
var mime = require("mime");
var app = express();
var fs = require("fs");

/* Getting all static files from this directory */

app.use(express.static("res"));

app.listen(8000);