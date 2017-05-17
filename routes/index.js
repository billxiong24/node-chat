var express = require('express');
var router = express.Router();
var authenticator = require('../app/authentication/user-pass.js')

/* GET home page. */
router.get('/', authenticator.checkLoggedIn, function(req, res, next) {
  res.render('index');
});

router.get('/home', authenticator.checkLoggedOut, function(req, res, next) {
    res.render('home', {name: req.session.user.name})
})

router.get('/login', authenticator.checkLoggedIn, function(req, res, next) {
    res.render('index')
})
router.post('/login', authenticator.checkLoggedIn, function(req, res, next) {
    authenticator.authenticate(req, res, next)
})
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
