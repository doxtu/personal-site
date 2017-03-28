var express = require("express");
var app = express();

/* Getting all static files from this directory */
app.use(express.static("res"));

/*set port to 80 when pushing to master*/
app.listen(8000);
