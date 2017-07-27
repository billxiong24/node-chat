var express = require('express');
var router = express.Router();
var authenticator = require('../app/authentication/user-pass.js');
var home = require('./home/home.js');
var chats = require('./chats/chats.js');
var cache_functions = require('../app/cache/cache_functions.js');

const timeout = require('connect-timeout');
const crypto = require('crypto');

module.exports = function(app, passport) {
    app.use('/', router);

    router.get('/', authenticator.checkLoggedIn, function(req, res, next) {
        res.render('index', {csrfToken: req.csrfToken()});
    });

    router.get('/login', timeout('3s'), haltOnTimeout, authenticator.checkLoggedIn, function(req, res, next) {
        //i dont think this works 
        if(req.timedout) {
            console.log("timedoutt");
            //try again
            res.redirect('/login');
            return;
        }

        if(process.env.NODE_ENV === 'test') {
            return res.status(200).send({csrfToken: req.csrfToken(), error: req.flash('error')[0]});
        }
        res.render('login', {csrfToken: req.csrfToken(), error: req.flash('error')[0]});
    });

    router.post('/login', authenticator.checkLoggedIn, function(req, res, next) {
        //for whatever reason, don't return next, no idea why
        authenticator.passportAuthCallback(passport, req, res, next);
    });

    router.get('/signup', authenticator.checkLoggedIn, function(req, res, next) {
        if(process.env.NODE_ENV === 'test') {
            return res.status(200).send({csrfToken: req.csrfToken()});
        }
        res.render('signup', {csrfToken: req.csrfToken()});
    });

    router.post('/signup', authenticator.checkLoggedIn, function(req, res, next) {
        authenticator.passportSignupCallback(passport, req, res, next);
    });

    router.post('/signup_auth', authenticator.checkLoggedIn, function(req, res, next) {
        authenticator.checkExistingUser(req, res);
    });

    router.post('/logout', function(req, res, next) {
        authenticator.logOut(req, res);
    });

    /* GET home page. */
    router.use('/home', home);
    router.use('/chats', chats);


    function haltOnTimeout(req, res, next) {
        if(!req.timedout) {
            return next();
        }
        console.log("timedout");
        //return next();
    }

    return router;

};
