var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
var manager = require('../../app/chat_functions/chat_manager.js');
router.get('/', authenticator.checkLoggedOut, function(req, res, next) {
    /* set all cookies here */
    res.cookie('userid', req.session.user.id, {httpOnly: false}); 
    req.session.set_cookie = true;

    /* TODO send all chat lists to jade */
   manager.loadChatLists(req.session.user, res);
});

/* POST request for fetching all data needed for home page */
router.post('/fetch_home', authenticator.checkLoggedOut, function(req, res, next) {
    /* send all relevant data here */
    res.send({cookie: req.session.user.id});
});

module.exports = router;
