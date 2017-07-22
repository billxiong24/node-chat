var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');
const session_handler = require('../../app/session/session_handler.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

router.get('/', authenticator.checkLoggedOut, function(req, res, next) {
    /* set all cookies here */
    //prevent user from manipulating cookie with browser javascript 
    res.cookie('userid', req.session.user.id, {
        httpOnly: true,
        secure: true
    });
    manager.loadChatLists(req.csrfToken(), req.session.user, req.session.members, res, function(userJSON) {
        if(process.env.NODE_ENV=== 'test') {
            console.log(userJSON);
            res.status(200).json(userJSON);
        }
        else {
            res.render('home', userJSON);
        }
    });
});

/* POST request for fetching all data needed for home page */
router.post('/fetch_home', authenticator.checkLoggedOut, function(req, res, next) {
    /* send all relevant data here */
    res.send({cookie: req.session.user.id});
});

module.exports = router;
