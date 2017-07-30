var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');
const Notification = require('../../app/models/notification.js');
const NotificationManager = require('../../app/chat_functions/notif_manager.js');
const UserManager = require('../../app/models/user_manager.js');
const UserCache = require('../../app/models/user_cache.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

router.get('/:chatID', authenticator.checkLoggedOut, function(req, res, next) {
    console.log(req.user);
    manager.loadChatLists(req.csrfToken(), req.user, req.session.members, res, function(userJSON, inChat) {
        if(process.env.NODE_ENV === 'test') {
            if(!inChat) {
                return res.redirect('/home');
            }
            res.status(200).send(userJSON);
        }
        else {
            if(!inChat) {
                return res.redirect('/home');
            }
            res.render('groupchat', userJSON);
        }
    }, req.params.chatID);
});

router.post('/loadLines', authenticator.checkLoggedOut, function(req, res, next) {
    console.log(req.user);
    manager.loadMoreLines(req.user.username, req.body.chatID, req.session.lastTimeStamp, req, res); 
});

router.post('/:chatID/renderInfo', authenticator.checkLoggedOut, function(req, res, next) {
    //hack
    console.log(req.user);
    var cachedCB = function(members) {
        res.status(200).send(members[req.params.chatID]);
    };
    var missCB = function(deepCopy) {
        res.status(200).send(deepCopy);
    };
    chatRender(req, res, cachedCB, missCB);
});

router.post('/:chatID/renderNotifs', authenticator.checkLoggedOut, function(req, res, next) {

});

router.post('/:chatID/initLines', authenticator.checkLoggedOut, function(req, res, next) {
    console.log(req.user);
    manager.loadLines(req.user.username, req.params.chatID, req, res);
});

router.post('/join_chat', authenticator.checkLoggedOut, function(req, res, next) {
    console.log(req.user);
    //TODO find a way to test this, since we are resetting members every time in the test
    for(var key in req.session.members) {
        //chat code was found 
        if(req.session.members[key].code === req.body.joinChat) {
            console.log("POST join_chat cached");
            res.redirect('/chats/' +  req.session.members[key].id);
            return;
        }
    } 
    //chat was not found
    var failure = function() { 
        if(process.env.NODE_ENV === 'test') {
            return res.json({error: 'wrong password'});
        }
        //TODO include error message to pass to view
        return res.redirect('/home'); 
    };
    var success = function(id, chatJSON) {
        req.session.members[chatJSON.id] = chatJSON;
        //when redirected, the chat info will be cached
        res.redirect('/chats/' + id);
    };
    manager.joinChat(req.user.username, req.body.joinChat, failure, success);
});

router.post('/create_chat', authenticator.checkLoggedOut, function(req, res, next) {
    console.log(req.user);
    manager.createChat(req.user.username, req.body.createChat, req.session.members, res);
});

router.post('/remove_user', authenticator.checkLoggedOut, function(req, res, next) {
    console.log(req.user);
    var userManager = new UserManager(new UserCache(req.user.username));
    userManager.leave(req.body.chatID, function(rows) {
        //this was a huge bug, and why we need unit tests
        delete req.session.members[req.body.chatID];
        res.status(200).send({deleted: rows.affectedRows});
    });
});

function chatRender(req, res, cachedCB, missCB) {
    var notif_manager = new NotificationManager(new Notification(req.params.chatID, req.user.username, -1));
    if(req.params.chatID in req.session.members) {
        notif_manager.loadNotifications(function(numNotifs) {
            console.log("post renderinfo cached");
            req.session.members[req.params.chatID].csrfToken = req.csrfToken();
            req.session.members[req.params.chatID].notifs = numNotifs;
            cachedCB(req.session.members);
        });
    }
    else {
        console.log("post renderinfo not cached");
        manager.loadChat(req.user.username, req.params.chatID, req.session.members, req.csrfToken(), res, function(deepCopy) {
            missCB(deepCopy);
        });
    }
}

module.exports = router;
