var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js')
var manager = require('../../app/chat_functions/chat_manager.js');

router.get('/:chatID', authenticator.checkLoggedOut, function(req, res, next) {
    /* TODO Load specific chat */
    if(!req.session.members[req.params.chatID]) {
        manager.loadChat(req.session.user.username, req.params.chatID, res);
    }
    else {
        res.render('chat', req.session.members[req.params.chatID]);
    }
});

router.post('/join_chat', authenticator.checkLoggedOut, function(req, res, next) {
    res.send("test join");
});

router.post('/create_chat', authenticator.checkLoggedOut, function(req, res, next) {
    var info = manager.createChat(res, req.body.createChat, req.session.user.username);
    req.session.members[info.id] = info; 
    //this is bad because query could finish after the page has loaded, but its ok for now
    res.redirect('/chats/' + info.id);
});


module.exports = router;

