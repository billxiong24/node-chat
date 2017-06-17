var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

router.get('/:chatID', authenticator.checkLoggedOut, function(req, res, next) {
    /* TODO CACHE THIS SHIT*/
    manager.loadChat(req.session.members, req.session.user.username, req.params.chatID, req, res);
    //if(!req.session.members[req.params.chatID]) {
        //manager.loadChat(req.session.members, req.session.user.username, req.params.chatID, res);
    //}

    //else {
        //res.render('chat', req.session.members[req.params.chatID]);
    //}
});

router.post('/loadLines', authenticator.checkLoggedOut, function(req, res, next) {
    manager.loadMoreLines(req.session.user.username, req.body.chatID, req.session.lastTimeStamp, req, res);
});

router.post('/join_chat', authenticator.checkLoggedOut, function(req, res, next) {
    manager.joinChat(req.session.members, req.session.user.username, req.body.joinChat, res);
});

router.post('/create_chat', authenticator.checkLoggedOut, function(req, res, next) {
    var info = manager.createChat(res, req.session.members, req.body.createChat, req.session.user.username);
    //req.session.members[info.id] = info; 
});


module.exports = router;

