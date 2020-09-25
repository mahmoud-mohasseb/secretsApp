//jshint esversion:6
// require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session")
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const { RSA_NO_PADDING } = require("constants");
const { nextTick } = require("process");




const port = process.env.PORT || 3000

const app = express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// solving for 
//(node:9128) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.

mongoose.set('useCreateIndex', true);

app.set("view engine", "ejs")
// don't forget to set right above mongoose connection
// setting up session
app.use(session({
    secret: "this is our secret",
    resave: false,
    saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })


// console.log(process.env.API_KEY);


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});
// user schema a plugin
userSchema.plugin(passportLocalMongoose);


// encryption only one filed which appear in array and you can add more
// move it to .env and follow .env rules
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

// we add these three lines of code for local passport 
// when we using session to crumble cookie in deserialize 

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/", function (req, res) {
    res.render("home")
});
app.get("/register", function (req, res) {
    res.render("register")
});

// if condition here used passport authentication
// and passport local mongoose
// isAuthenticated don't forget prases after it
app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login");
    }
});

app.post("/register", function (req, res) {
    // bcrypt.genSalt(saltRounds, function (err, salt) {
    //     bcrypt.hash(req.body.password, salt, function (err, hash) {
    //         const newUser = new User({
    //             email: req.body.username,
    //             password: hash,
    //         });
    //         newUser.save(function (err) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 res.render("secrets")
    //             }
    //         });
    //     });
    // });
    // ---------------------------------
    // note using passport local mongoose to authenticate to login

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            })
        }
    })
});
app.get("/login", function (req, res) {
    res.render("login")
});

app.post("/login", function (req, res) {

    // const username = req.body.username;
    // const password = req.body.password;
    // User.findOne({ email: username }, function (err, foundUser) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         if (foundUser) {

    //             // Load hash from your password DB.
    //             bcrypt.compare(password, foundUser.password, function (err, result) {
    //                 // result == true
    //                 if (result === true) {
    //                     res.render("secrets")
    //                 } else {
    //                     res.send("check your email or password")
    //                 }
    //             });

    //             // if (foundUser.password === password) {
    //             // }
    //         }
    //     }
    // });
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    // using passport to login 
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }

    })

});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/")
})

app.listen(port, function () {
    console.log("listen on 3000");
})