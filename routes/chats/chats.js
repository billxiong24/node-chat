var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');
const Notification = require('../../app/models/notification.js');
const NotificationManager = require('../../app/chat_functions/notif_manager.js');
const session_handler = require('../../app/session/session_handler.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

router.get('/:chatID', authenticator.checkLoggedOut, function(req, res, next) {
    /* TODO CACHE THIS SHIT*/

    var notif_manager = new NotificationManager(new Notification(req.params.chatID, req.session.user.username, -1));

    if(req.params.chatID in req.session.members) {
        notif_manager.loadNotifications(function(numNotifs) {
            console.log("GET chatID cached");
            //TODO fix this shit
            req.session.members[req.params.chatID].csrfToken = req.csrfToken();
            req.session.members[req.params.chatID].notifs = numNotifs;
            res.render('chat', req.session.members[req.params.chatID]);
        });
    }
    else {
        manager.loadChat(req.session.user.username, req.params.chatID, req.session.members, req.csrfToken(), res);
    }
});

router.post('/loadLines', authenticator.checkLoggedOut, function(req, res, next) {
    manager.loadMoreLines(req.session.user.username, req.body.chatID, req.session.lastTimeStamp, req, res); 
});

router.post('/:chatID/renderInfo', authenticator.checkLoggedOut, function(req, res, next) {
    //hack
    var notif_manager = new NotificationManager(new Notification(req.params.chatID, req.session.user.username, -1));

    if(req.params.chatID in req.session.members) {
        notif_manager.loadNotifications(function(numNotifs) {
            console.log("post renderinfo cached");
            //TODO fix this shit
            req.session.members[req.params.chatID].csrfToken = req.csrfToken();
            req.session.members[req.params.chatID].notifs = numNotifs;
            res.send(req.session.members[req.params.chatID]);
        });
    }
    else {
        console.log("post renderinfo not cached");
        manager.renderChatInfo(req.session.user.username, req.params.chatID, req.session.members, req.csrfToken(), res);
    }
});

router.post('/:chatID/renderNotifs', authenticator.checkLoggedOut, function(req, res, next) {

});

router.post('/:chatID/initLines', authenticator.checkLoggedOut, function(req, res, next) {

    manager.loadLines(req.session.user.username, req.params.chatID, req, res);
});

router.post('/join_chat', authenticator.checkLoggedOut, function(req, res, next) {

    for(var key in req.session.members) {
        //chat code was found 
        if(req.session.members[key].code === req.body.joinChat) {
            console.log("POST join_chat cached");
            res.redirect('/chats/' +  req.session.members[key].id);
            return;
        }
    } 
    //chat was not found
    manager.joinChat(req.session.user.username, req.body.joinChat, req.session.members, res);

});

router.post('/create_chat', authenticator.checkLoggedOut, function(req, res, next) {

    manager.createChat(req.session.user.username, req.body.createChat, req.session.members, res);
    //req.session.members[info.id] = info; 
});


module.exports = router;

