/**
 * user-password authentication using passport.js
 */
const password_util = require('./password_util');
const validate_cred_util = require('./validate_cred_util.js');
const connection = require('../database/config.js');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const Manager = require('../chat_functions/chat_manager.js');
const Chat = require('../models/chat.js');
const cache_functions = require('../cache/cache_functions.js');

const params = {
    usernameField : 'username', 
    passwordField : 'password',
    passReqToCallback : true
};

//middleware need to return next function
function checkLoggedOut(req, res, next) {
    if(!req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        //need to return next to pass on to the next function,
        //but only do it if we are logged in. Don't do this
        //if we redirected, because that wiil send headers twice
        return next();
    }
}
function checkLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/home');
    }
    else {
        return next();
    }
}

function passportSignupCallback(passport, req, res, next) {
    passport.authenticate('signup', function(err, user, info) {
        console.log(err, user, info);
        if(err) {
            console.log(err);
            return;
        }

        if(!user) {
            res.render('index', {
                csrfToken:req.csrfToken(),
                signup_error: "There was an error. Pleas try again."
            });
            return;
        }

        req.login(user, function(err) {
            if(err) {
                console.log(err);
                return;
            }
            req.session.user = user;
            res.redirect('/home');
        });
    })(req, res, next);
}

function passportAuthCallback(passport, req, res, next) {
    passport.authenticate('login', function(err, user, info) {
        if(err) {
            console.log(err);
            return;
        }
        if(!user) {
            res.send({login_error : true});
            return;
        }

        req.login(user, function(err) {
            if(err) { console.log(err); }
            
            res.send({login_error : false});
        });

    })(req, res, next);
}

function logOut(req, res) {
    req.logout();
    req.session.destroy(function(err) {
        console.log("destroyed");
        res.redirect('/');
    });
}

function checkExistingUser(req, res) {

    if(!validate_cred_util.validateUsername(req.body.username)) {
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

function passportAuth(passport) {

    //functions for serializing and deserializing users for session
    passport.serializeUser(function(user, done) {
        console.log("serializing user");
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log("deserializing user");
        //TODO cache this shit, so we dont hit db on every request
        connection.execute('SELECT id, username, first, last FROM User WHERE id = ? ', [id], function(rows) {
            done(null, rows[0]);
        });
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'user_signup',
        passwordField: 'password_signup', passReqToCallback: true
    }, function(req, user_signup, password_signup, done) {
            
            var info = {
                id: crypto.randomBytes(10).toString('hex'),
                username: user_signup,
                password: password_signup,
                first: req.body.firstname_signup,
                last: req.body.lastname_signup
            };

            if(!validate_cred_util.validateUsername(info.username)) {
                return done(null, false, req.flash('error', 'Signup error.'));
            }

            password_util.storePassword(info.password, function(err, hash) {
                info.password = hash;
                connection.execute('INSERT INTO User SET ? ', info, function(rows) {
                    //TODO USE user object here
                    req.session.user = {
                        username: info.username,
                        first: info.first,
                        last: info.last
                    };
                    req.session.members = {};
                    delete info.password;
                    return done(null, info);
                },
                function(err) {
                    return done(null, false, req.flash('signup_error', 'There was an error signing up'));
                });
            });
        }
    ));

    passport.use('login', new LocalStrategy(params, function(req, username, password, done) {
            //authentication here        
            //TODO these queries should go in the User class 

            var conn = null;
            var checkDB = function(poolConnection) {
                conn = poolConnection;
                return poolConnection.query('SELECT * FROM User WHERE User.username = ?', [username]);
            };

            var validate = function(rows) {
                if(rows.length === 0) {
                    return done(null, false, req.flash('error', 'Login error.'));
                }
                password_util.retrievePassword(password, rows[0].password, function(err, result) {
                    //result is either true or false
                    if(result) {
                        req.session.user = rows[0];
                        req.session.rooms = [];
                        req.session.members = {};

                        return done(null, rows[0]); 
                    }
                    return done(null, false, req.flash('error', 'Login error.'));
                });
                console.log("releasing connection");
                connection.release(conn);
            };

            connection.executePoolTransaction([checkDB, validate], function(err) {console.log(err);});
        }
        
    ));
}

module.exports = {logOut, checkLoggedOut, checkLoggedIn, passportSignupCallback, checkExistingUser, passportAuth, passportAuthCallback};
