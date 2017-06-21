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
    //req.sessionID is stored in redis, use that instead. make sure it expires too

    res.cookie('userid', req.session.user.id, {httpOnly: false}); 
    manager.loadChatLists(req.session._csrf, req.session.user, res);

    //session_handler.handleSession(req.sessionID, function(session) {
        ////set cookie containg userid for client session, we are local storage now
        //res.cookie('userid', session.user.id, {httpOnly: false}); 
        //manager.loadChatLists(session.user, res);
    //});

});

/* POST request for fetching all data needed for home page */
router.post('/fetch_home', authenticator.checkLoggedOut, function(req, res, next) {
    /* send all relevant data here */

    res.send({cookie: req.session.user.id});
    //session_handler.handleSession(req.sessionID, function(session) {
    //});
});

module.exports = router;
