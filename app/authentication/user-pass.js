/**
 * user-password authentication using passport.js
 * Can extend to use other forms of authentication
 * jk super ratchet authentication :(
 */
//const var passport = require('passport');

const connection = require('../database/config.js');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const Manager = require('../chat_functions/chat_manager.js');
const Chat = require('../models/chat.js');

const params = {
    usernameField : 'username', 
    passwordField : 'password',
    passReqToCallback : true
};

//middleware need to return next function
function checkLoggedOut(req, res, next) {
    if(!req.isAuthenticated()) {
        res.redirect('/login');
    }
    return next();
}
function checkLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/home');
    }

    return next();
}

function authenticate(req, res) {
    //TODO does this prevent sql injection??
    connection.execute('SELECT id, username, first, last FROM User WHERE User.username = ? and User.password = ?', [req.body.username, req.body.password], function(rows) {
        if(rows.length > 0) {
            req.session.user = rows[0];
            //TODO FILL rooms in
            req.session.rooms = [];
            //contains all created chats in this session
            req.session.members = {};
            res.send({login_error: false});
        }
        else {
            //TODO error checking
            res.send({login_error: true});
        }
    });
}

function logOut(req, res) {
    req.session.destroy();
    res.redirect('/');
}

function checkExistingUser(req, res) {

    if(req.body.username.length < 4) {
        res.send("Username must be at least 4 characters long.");
        return;
    }

    connection.execute('SELECT COUNT(User.username) AS count FROM User WHERE User.username = ? ', [req.body.username], function(rows) {
        if(rows[0].count > 0) {
            res.send("Username exists.");
        }
        else {
            res.send("");
        }
    });
}

function signUp(req, res) {
    //sign up logic here

    //TODO encrypt password
    var info = {
        id: crypto.randomBytes(10).toString('hex'),
        username: req.body.user_signup,
        password: req.body.password_signup,
        first: req.body.firstname_signup,
        last: req.body.lastname_signup
    };
    connection.execute('INSERT INTO User SET ? ', info, function(rows) {
        req.session.user = {
            username: info.username,
            first: info.first,
            last: info.last
        };
        
        res.redirect('/home');
    },
    function(err) {
        console.log(err);
        res.redirect('/');
    });
}

function passportAuth(passport) {

    //functions for serializing and deserializing users for session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        //TODO fill in query here  
        connection.execute('SELECT id, username, first, last FROM User WHERE id = ? ', [id], function(rows) {
            done(null, rows[0]);
        });
    });

    passport.use('signup', new LocalStrategy(params, function(req, username, password, done) {
            //authentication here        
        }
    ));

    passport.use('login', new LocalStrategy(params, function(req, username, password, done) {
            //authentication here        
            connection.execute('SELECT id, username, first, last FROM User WHERE User.username = ? and User.password = ?', [username, password], function(rows) {

                if(rows.length === 0) {
                    return done(null, false, req.flash('error', 'Login error.'));
                }

                //still need these session variables because of socket shit
                req.session.user = rows[0];
                req.session.rooms = [];
                req.session.members = {};

                return done(null, rows[0]); 

            }, function(err) {console.log(err);});
        }
        
    ));
}

module.exports = {logOut, checkLoggedOut, checkLoggedIn, authenticate, signUp, checkExistingUser, passportAuth};
