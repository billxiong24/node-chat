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
    manager.loadChatLists(req.csrfToken(), req.user, function(userJSON, inChat, members) {
        req.session.members = members;
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

router.get('/:chatID/loadLines', authenticator.checkLoggedOut, function(req, res, next) {
    manager.loadMoreLines(req.user.username, req.params.chatID, req.session.lastTimeStamp, function(lineResults) {
        console.log(req.session.lastTimeStamp + " BEFORE");
        req.session.lastTimeStamp = (lineResults !== null && lineResults.length > 0) ?  lineResults[lineResults.length - 1].stamp : null;
        console.log(req.session.lastTimeStamp + "after");

        if(req.session.lastTimeStamp !== null) {
            return res.status(200).json({lines: lineResults, username: req.user.username});
        }
        res.status(200).json({lines: null});
    }); 
});

router.get('/:chatID/renderInfo', authenticator.checkLoggedOut, function(req, res, next) {
    //hack
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

router.get('/:chatID/initLines', authenticator.checkLoggedOut, function(req, res, next) {
    manager.loadLines(req.user.username, req.params.chatID, function(lineResults) {
        req.session.lastTimeStamp = lineResults.length > 0 ? lineResults[0].stamp : null;
        console.log(req.session.lastTimeStamp + " on load tmee");
        res.status(200).send({lines: lineResults});
    });
});

router.post('/join_chat', authenticator.checkLoggedOut, function(req, res, next) {
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
    var success = function(chatJSON) {
        req.session.members[chatJSON.id] = chatJSON;
        //when redirected, the chat info will be cached
        res.redirect('/chats/' + chatJSON.id);
    };
    manager.joinChat(req.user.username, req.body.joinChat, failure, success);
});

router.post('/create_chat', authenticator.checkLoggedOut, function(req, res, next) {
    manager.createChat(req.user.username, req.body.createChat, function(chatInfo) {
        req.session.members[chatInfo.id] = chatInfo;
        res.status(200);
        res.redirect('/chats/' + chatInfo.id);
    });
});

router.post('/remove_user', authenticator.checkLoggedOut, function(req, res, next) {
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
        //i dont think this will ever get reached since u join before this function is reached
        console.log("post renderinfo not cached");
        manager.loadChat(req.user.username, req.params.chatID, function(deepCopy) {
            if(!deepCopy) {
                return missCB(null);
            }
            req.session.members[deepCopy.id] = deepCopy;
            
            var infoDeepCopy = JSON.parse(JSON.stringify(deepCopy));
            infoDeepCopy.csrfToken = req.csrfToken();
            missCB(infoDeepCopy);
        });
    }
}

module.exports = router;
