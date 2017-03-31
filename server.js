var express = require("express");
var app = express();

/* Getting all static files from this directory */
app.use(express.static("res"));
app.use(express.static("res/static"));
app.use("/icop",express.static("res/static/icop"));

/*set port to 80 when pushing to master*/
app.listen(8000);
