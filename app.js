//jshint esversion:6
// require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const saltRounds = 10;



const port = process.env.PORT || 3000

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })


// console.log(process.env.API_KEY);


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
})

// encryption only one filed which appear in array and you can add more
// move it to .env and follow .env rules
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);


app.get("/", function (req, res) {
    res.render("home")
});
app.get("/register", function (req, res) {
    res.render("register")
});


app.post("/register", function (req, res) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            const newUser = new User({
                email: req.body.username,
                password: hash,
            });
            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("secrets")
                }
            });
        });
    });
});
app.get("/login", function (req, res) {
    res.render("login")
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets")
                }
            }
        }
    })
})

app.listen(port, function () {
    console.log("listen on 3000");
})