var logger = require('../../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');
const Notification = require('../../app/models/notification.js');
const NotificationManager = require('../../app/chat_functions/notif_manager.js');
const UserManager = require('../../app/models/user_manager.js');
const UserCache = require('../../app/models/user_cache.js');
const CleanClient = require('../../app/cache/clean_client.js');

var ChatRequest = require('../../microservices/chat/chat_requester.js');
var NotifRequest = require('../../microservices/notifs/notif_request.js');
var ChatSearchManager = require('../../app/search/chat_search_manager.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}
router.get('/:chatID', authenticator.checkLoggedOut, function(req, res, next) {
    var clean_client = new CleanClient();
    var chatRequester = new ChatRequest(clean_client.genClient());

    chatRequester.loadChatListRequest(req.csrfToken(), req.user, function(channel, json) {
        clean_client.cleanup();

        logger.info("received in", req.user.username);
        logger.info("------------------------------------------------");
        req.session.members = json.members;
        logger.debug("*************", json.userJSON, "*******************8");
        if(process.env.NODE_ENV === 'test') {
            if(!json.inChat) {
                return res.redirect('/home');
            }
            res.status(200).send(json.userJSON);
        }
        else {
            if(!json.inChat) {
                return res.redirect('/home');
            }
            res.render('groupchat', json.userJSON);
        }
    }, req.params.chatID);
});

router.get('/:chatID/loadLines', authenticator.checkLoggedOut, function(req, res, next) {
    manager.loadMoreLines(req.user.username, req.params.chatID, req.session.lastTimeStamp, function(lineResults) {
        logger.info(req.session.lastTimeStamp + " BEFORE");
        req.session.lastTimeStamp = (lineResults !== null && lineResults.length > 0) ?  lineResults[lineResults.length - 1].stamp : null;
        logger.info(req.session.lastTimeStamp + "after");

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

//router.post('/:chatID/renderNotifs', authenticator.checkLoggedOut, function(req, res, next) {

//});

router.get('/:chatID/initLines', authenticator.checkLoggedOut, function(req, res, next) {
    manager.loadLines(req.user.username, req.params.chatID, function(lineResults) {
        req.session.lastTimeStamp = lineResults.length > 0 ? lineResults[0].stamp : null;
        logger.info(req.session.lastTimeStamp + " on load tmee");
        res.status(200).send({lines: lineResults});
    });
});

router.post('/verify_chat', authenticator.checkLoggedOut, function(req, res, next) {
    var chat_id = req.body.chat_id;
    var code = req.body.code;

    for(var key in req.session.members) {
        //chat code was found 
        if(req.session.members[key].code === code && req.session.members[key].id === chat_id) {
            logger.info("POST verify_chat cached");
            res.json({
                joined: true,
                prevJoined: true
            });
            //res.redirect('/chats/' +  req.session.members[key].id);
            return;
        }
    }
    var failure = function() { 
        logger.info("chat not found");
        if(process.env.NODE_ENV === 'test') {
            return res.json({error: 'wrong password'});
        }
        //TODO include error message to pass to view
        return res.json({
            error: true
        });
    };
    var success = function(chatJSON) {
        logger.info("chat found", chatJSON);
        req.session.members[chatJSON.id] = chatJSON;
        //when redirected, the chat info will be cached
        return res.json({
            joined: true
        });
    };

    var clean_client = new CleanClient();
    var chatRequester = new ChatRequest(clean_client.genClient());

    chatRequester.joinChatRequest(req.user.username, req.body.code, function(channel, json) {
        clean_client.cleanup();
        logger.info("checked specific chat");
        logger.info(json);
        if(json.join_error) {
            failure();
        }
        else {
            success(json);
        }
    }, chat_id);
});

router.post('/join_chat', authenticator.checkLoggedOut, function(req, res, next) {
    //TODO find a way to test this, since we are resetting members every time in the test
    for(var key in req.session.members) {
        //chat code was found 
        if(req.session.members[key].code === req.body.joinChat) {
            logger.info("POST join_chat cached");
            res.redirect('/chats/' +  req.session.members[key].id);
            return;
        }
    }
    //chat was not found
    var failure = function() { 
        logger.info("chat not found");
        if(process.env.NODE_ENV === 'test') {
            return res.json({error: 'wrong password'});
        }
        //TODO include error message to pass to view
        return res.redirect('/home'); 
    };
    var success = function(chatJSON) {
        //enter this function if chat was not joined before
        logger.info("chat found", chatJSON);
        req.session.members[chatJSON.id] = chatJSON;
        if(process.env.NODE_ENV === 'test') {
            return res.status(200).json({joined: true});
        }

        new ChatSearchManager().incrementField(chatJSON.id, 'num_members', 1, function(err, result) {
            logger.info(result, '**** result from incrementing members in search ****');
        });
        //when redirected, the chat info will be cached
        res.redirect('/chats/' + chatJSON.id);
    };

    var clean_client = new CleanClient();
    var chatRequester = new ChatRequest(clean_client.genClient());

    chatRequester.joinChatRequest(req.user.username, req.body.joinChat, function(channel, json) {
        clean_client.cleanup();

        logger.info("joined chat micro callback");
        if(json.join_error) {
            failure();
        }
        else {
            success(json);
        }
    });
});

router.post('/create_chat', authenticator.checkLoggedOut, function(req, res, next) {
    var clean_client = new CleanClient();
    var chatRequester = new ChatRequest(clean_client.genClient());

    chatRequester.createChatRequest(req.user.username, req.body.createChat, function(channel, chatInfo) {
        clean_client.cleanup();

        req.session.members[chatInfo.id] = chatInfo;
        logger.debug(chatInfo, "****chat infofooo****");

        new ChatSearchManager().createDocument(chatInfo, function(err, res) {
            logger.info("added document to index after creating chat", res);
        });
        res.status(200);
        res.redirect('/chats/' + chatInfo.id);
    });
});

router.post('/remove_user', authenticator.checkLoggedOut, function(req, res, next) {
    var userManager = new UserManager(new UserCache(req.user.username));
    userManager.leave(req.body.chatID, function(rows) {
        //this was a huge bug, and why we need unit tests
        delete req.session.members[req.body.chatID];

        new ChatSearchManager().incrementField(req.body.chatID, 'num_members', -1, function(err, result) {
            logger.info("*** removed a user from chat elasticsearch", result);
        });
        res.status(200).send({deleted: rows.affectedRows});
    });
});

function chatRender(req, res, cachedCB, missCB) {
    var notif_manager = new NotificationManager(new Notification(req.params.chatID, req.user.username, -1));

    if(req.params.chatID in req.session.members) {
        logger.info("post renderinfo cached");
        req.session.members[req.params.chatID].csrfToken = req.csrfToken();
        //req.session.members[req.params.chatID].notifs = numNotifs;
        cachedCB(req.session.members);
    }
    else {
        //i dont think this will ever get reached since u join before this function is reached
        logger.info("post renderinfo not cached");
        //TODO use microservice
        var clean_client = new CleanClient();
        var chatRequester = new ChatRequest(clean_client.genClient());

        chatRequester.loadChatRequest(req.user.username, req.params.chatID, function(channel, deepCopy) {
            clean_client.cleanup();
            logger.info(req.user.username, req.params.chatID);
            logger.info(deepCopy);
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
