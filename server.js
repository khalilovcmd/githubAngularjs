// modules
var 
	express = require("express"),
	ejs = require("ejs");

// setup express app
var app = new express();
app.set("views", __dirname + "/");
app.engine(".html", ejs.__express);
app.set("view engine", "ejs");
app.use("/", express.static(__dirname + "/"));

// express routes
app.get("/", function(req, res) {
	res.render("app.html", {});
	return;
});

// listen on configured port
app.listen(4000);