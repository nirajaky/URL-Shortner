'use strict';

var express    = require("express"),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    app        = express(),
    useragent  = require('express-useragent');

// MONGOOSE SCHEMA
var userSchema = new mongoose.Schema({
    URL: String,
    random: String,
    os: String,
    browser: String,
    created: { type: Date, default: Date.now },
    count: { type: Number, default: 0 } 
});
var User = mongoose.model("User", userSchema);

// APP Configuration
app.use(useragent.express());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost/URL_Shortner", { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/", function (req, res) {
    res.redirect("/index");
});

// ADD URL TO DATABASE
app.get("/index", function (req, res) {
    var URL = req.query.AddUrl;
    var random = Math.floor(Math.random() * 100000); 
    var newUser = { URL: URL, random: random };
    User.create(newUser, function (err, userReturned) {
        if (err) {
            console.log("Error in posting");
        } else {
            res.render("index.ejs", { random: random });
        }
    });
});

// VISIT CODED URL
app.get("/index/code", function (req, res) {

    //console.log(req.useragent.os);
    var str = req.query.url;
    
    var len = str.length;
    str = str.slice(len - 5, len);
    var ind = str.indexOf("/");
    str = str.slice(ind + 1, str.length);

    // SHOW PAGE WITH details about that short code
    if (str.substring(str.length - 1, str.length) == "+") {
        str = str.substring(0, str.length - 1);
        User.find({ random: str }, function (err, foundUser) {
            res.render("show.ejs", { foundUser: foundUser });
        });
        
    }

    User.find({ random: str }, function (err, foundUser) {
        if (err) {
            console.log("ERROR");
        } else {
            // UPDATE DATA for visited URL
            var countt = foundUser[0].count + 1;
            var obj = {
                URL: foundUser[0].URL,
                random: foundUser[0].random,
                created: foundUser[0].created,
                count: countt,
                os: req.useragent.os,
                browser: req.useragent.browser
            };
            // DATABASE Update
            User.findByIdAndUpdate(foundUser[0]._id, obj, function (err, updatedBlog) {
                if (err) {
                    res.redirect("/blogs");
                } else {
                    //res.redirect("/blogs/" + req.params.id);
                }
            });

            console.log(foundUser);
            console.log("OS Address is",foundUser[0].os);
            res.redirect(foundUser[0].URL);
        }
    });
    console.log(str);
});

app.listen(1000, function () {
    console.log("Server is running");
})
