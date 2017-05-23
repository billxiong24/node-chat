var express = require('express');
var router = express.Router();
var authenticator = require('../app/authentication/user-pass.js')
var home = require('./home/home.js');
var chats = require('./chats/chats.js');


router.get('/', authenticator.checkLoggedIn, function(req, res, next) {
    //console.log(req.app.locals.test + " heyyyy");
    res.render('index');
});

router.get('/login', authenticator.checkLoggedIn, function(req, res, next) {
    res.render('index')
});

router.post('/login', authenticator.checkLoggedIn, function(req, res, next) {
    authenticator.authenticate(req, res, next);
    //dont return next() because it will send headers twice apparently
    //return next()
});

router.get('/signup', authenticator.checkLoggedIn, function(req, res, next) {
    res.render('index')
});

router.post('/signup', authenticator.checkLoggedIn, function(req, res, next) {
    authenticator.signUp(req, res, next);
});

router.post('/signup_auth', authenticator.checkLoggedIn, function(req, res, next) {
    authenticator.checkExistingUser(req, res, next);
});

/* GET home page. */
router.use('/home', home);
router.use('/chats', chats);
//router.get('/home', authenticator.checkLoggedOut, function(req, res, next) {

    //[>set all cookies here <]
    //res.cookie('userid', req.session.user.id, {httpOnly: false}); 
    //res.render('home', {name: req.session.user.name})
//});

//[> POST request for fetching all data needed for home page <]
//router.post('/fetch_home', authenticator.checkLoggedOut, function(req, res, next) {
    //res.send({cookie: req.cookies.userid});
//});



//router.post('/login', passport.authenticate('login', {
        //successRedirect: '/home',
        //failureRedirect : '/',
        //failureFlash : false
    //},
    //function(req, res) {
        //console.log("success")
    //}

//));

module.exports = router;
