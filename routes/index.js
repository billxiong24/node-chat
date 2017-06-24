var express = require('express');
var router = express.Router();
var authenticator = require('../app/authentication/user-pass.js');
var home = require('./home/home.js');
var chats = require('./chats/chats.js');
var check_csrf = require('../app/csrf/check_csrf.js');
var session_handler = require('../app/session/session_handler.js');
const crypto = require('crypto');



module.exports = function(app, passport) {
    app.use('/', router);


    router.get('/', authenticator.checkLoggedIn, function(req, res, next) {
        console.log(req);
        res.render('index', {csrfToken: req.csrfToken()});
    });

    router.get('/login', authenticator.checkLoggedIn, function(req, res, next) {
        res.render('index', {csrfToken: req.csrfToken(), error: req.flash('error')[0]});
    });

    router.post('/login', authenticator.checkLoggedIn, function(req, res, next) {
        //for whatever reason, don't return next, no idea why
        check_csrf(req, res, function() {
            authenticator.passportAuthCallback(passport, req, res, next);
        }, false);
    });

    router.get('/signup', authenticator.checkLoggedIn, function(req, res, next) {
        res.render('index', {csrfToken: req.csrfToken()});
    });

    router.post('/signup', function(req, res, next) {
        check_csrf(req, res, function() {
            authenticator.passportSignupCallback(passport, req, res, next);
        }, false);
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

    return router;

};
