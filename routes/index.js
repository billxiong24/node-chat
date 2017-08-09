var logger = require('../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var authenticator = require('../app/authentication/user-pass.js');
var home = require('./home/home.js');
var chats = require('./chats/chats.js');
var users = require('./users/users.js');
var cache_functions = require('../app/cache/cache_functions.js');
var email = require('../app/authentication/email.js');
var UserManager = require('../app/models/user_manager.js');
var UserCache = require('../app/models/user_cache.js');

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

    router.get('/signup_success', email.checkEmailVerified, function(req, res, next) {
        if(req.session.sent) {
            logger.info("sent email already");
            return res.render('signup_success', {first: req.user.first, csrfToken: req.csrfToken()});
        }
        email.sendEmailConfirmation(req.user.email, req.user.hash, function(err, info) {
            res.render('signup_success', {first: req.user.first, csrfToken: req.csrfToken()});
            req.session.sent = true;
        });
    });

    router.post('/signup_auth', authenticator.checkLoggedIn, function(req, res, next) {
        authenticator.checkExistingUser(req, res);
    });

    //TODO test this extensively
    router.get('/confirm/:hash', email.checkEmailVerified, function(req, res, next) {
        //TODO set confirmed to true in both cache and database
        var userManager = new UserManager(new UserCache(req.user.username).setJSON(req.user));
        userManager.authenticateEmail(req.user, req.params.hash, function(rows) {
            if(!rows) {
                //TODO render some error page
                res.status(403).send({auth: 'forbidden'});
                return;
            }
            res.render('registered');
        });
    });

    //FIXME check email verified middleware
    router.post('/sendEmail', email.checkEmailVerified, function(req, res, next) {
        email.sendEmailConfirmation(req.user.email, req.user.hash, function(err, info) {
            res.status(200).json({sent: true});
        });
    });

    router.post('/logout', function(req, res, next) {
        authenticator.logOut(req, res);
    });

    router.use('/home', home);
    router.use('/chats', chats);
    router.use('/users', users);


    function haltOnTimeout(req, res, next) {
        if(!req.timedout) {
            return next();
        }
        //return next();
    }

    return router;

};
