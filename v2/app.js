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
    created: { type: Date, default: Date.now },
    count: { type: Number, default: 0 },
    browser: String,
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
    var newUser = { URL: URL, random: random, count:0 };
    User.create(newUser, function (err, userReturned) {
        if (err) {
            console.log("Error in posting");
        } else {
            res.render("index.ejs", { random: random });
        }
    });
});

/*
    // SHOW PAGE WITH details about that short code
    if (str.substring(str.length - 1, str.length) == "+") {
        var str1 = str.substring(0, str.length - 1);
        console.log("str1", str1);
        User.find({ random: str1 }, function (err, foundUser) {
            if (err) {
                console.log("Error");
            } else {
                //console.log(foundUser);
                res.render("show.ejs");
                //str = str.slice(ind-1, str.length -2);
            }
        });

    }
    */


// VISIT CODED URL
app.get("/index/code", function (req, res) {

    //console.log(req.useragent.os);
    var str = req.query.url;

    var len = str.length;
    str = str.slice(len - 6, len);
    var ind = str.indexOf("/");
    str = str.slice(ind + 1, str.length);
   
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
            console.log("OS Address is", foundUser[0].os);
            res.redirect(foundUser[0].URL);
        }
    });  
    console.log(str);
});

app.get("/show", function (req, res) {

    var str = req.query.ExtUrl;

    var len = str.length;
    str = str.slice(len - 6, len);
    var ind = str.indexOf("/");
    str = str.slice(ind + 1, str.length - 1);
    console.log(str);
   
    User.find({ random: str }, function (err, foundUser) {
         if (err) {
                console.log("ERROR");
         } else {
             console.log(foundUser);
              res.render("show.ejs", { foundUser: foundUser });
          }
    });
});

app.listen(1000, function () {
    console.log("Server is running");
})
