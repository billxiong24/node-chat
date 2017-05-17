/**
 * user-password authentication using passport.js
 * Can extend to use other forms of authentication
 * jk super ratchet authentication :(
 */
//const var passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const params = {
    usernameField : 'username', 
    passwordField : 'password'
};

function checkLoggedOut(req, res, next) {
    if(!req.session) {
        res.redirect('/')
    }
    else if(!req.session.user) {
        res.redirect('/')
    }
    return next()
}
function checkLoggedIn(req, res, next) {
    console.log("SESSION" + req.session)
    if(req.session && req.session.user) {
        res.redirect('/home')
    }

    return next()
}

function authenticate(req, res, next) {
    //database goes here
    if(req.body.username === "billxiong24" && req.body.password === "password") {
        //create session variable
        req.session.user = {name : "bill xiong", email : "wwx@duke.edu"}
        res.redirect('/home')
    }
    else {
        res.redirect('/')
    }
    //return next()
}

function signUp(req, res, next) {
    //sign up logic here
}

function passportAuth(passport) {

    //functions for serializing and deserializing users for session
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done) {
        //TODO fill in query here  
        done(null, {name:"Bill Xiong", password:"passwo", id:"1234"})
    })

    passport.use('signup', new LocalStrategy(params, function(req, username, password, done) {
            //authentication here        
        }
    ))

    passport.use('login', new LocalStrategy(params, function(username, password, done) {
            //authentication here        
            if(username !== "Bill Xiong" || password !== "passwo") {
                return done(null, false, {error : 'Bad login'})
            }
            return done(null, {name:"Bill Xiong", password:"passwo", id:"1234"})
        }
        
    ))
}

module.exports = {checkLoggedOut, checkLoggedIn, authenticate, signUp}
