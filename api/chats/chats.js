var logger = require('../../util/logger.js')(module);
var express = require('express');
var router = express.Router();
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
router.get('/:chatID', function(req, res, next) {

    var userJSON = Object.assign({}, req.query);


    //TODO make csrfToken null
    manager.loadChatLists(null, userJSON, function(userJSON, inSpecificChat, members) {
        res.status(200).json({
            userJSON: userJSON,
            inSpecificChat: inSpecificChat,
            members: members
        });
    }, req.params.chatID);
});

//TODO make stateless
//router.get('/:chatID/loadLines', function(req, res, next) {
    //manager.loadMoreLines(req.user.username, req.params.chatID, req.session.lastTimeStamp, function(lineResults) {
        //logger.info(req.session.lastTimeStamp + " BEFORE");
        //req.session.lastTimeStamp = (lineResults !== null && lineResults.length > 0) ?  lineResults[lineResults.length - 1].stamp : null;
        //logger.info(req.session.lastTimeStamp + "after");

        //if(req.session.lastTimeStamp !== null) {
            //return res.status(200).json({lines: lineResults, username: req.user.username});
        //}
        //res.status(200).json({lines: null});
    //}); 
//});

router.get('/:chatID/renderInfo', function(req, res, next) {
    //hack
    var missCB = function(deepCopy) {
        res.status(200).send(deepCopy);
    };
    chatRender(req, res, missCB);
});

//TODO make stateless
//router.get('/:chatID/initLines', function(req, res, next) {
    //manager.loadLines(req.user.username, req.params.chatID, function(lineResults) {
        //req.session.lastTimeStamp = lineResults.length > 0 ? lineResults[0].stamp : null;
        //logger.info(req.session.lastTimeStamp + " on load tmee");
        //res.status(200).send({lines: lineResults});
    //});
//});

router.put('/:chatID/updatedName', function(req, res, next) {
    manager.changeName(req.params.chatID, req.body.newName, function(rows) {
        new ChatSearchManager().update(req.params.chatID, 'chat_name', req.body.newName, function(err, response) {
            logger.info('updated chat name');
        });
        res.status(200).send({
            success: true
        });
    });
});

router.put('/:chatID/updatedCode', function(req, res, next) {
    manager.changeCode(req.params.chatID, req.body.newCode, function(rows) {
        res.status(200).send({
            success: true
        });
    });
});

router.post('/:chatID/newDescription', function(req, res, next) {
    manager.addDescription(req.params.chatID, req.body.description, function(rows) {
        res.status(200).send({
            success: true
        });
    });
});

router.post('/verify_chat', function(req, res, next) {
    var chat_id = req.body.chat_id;

    var failure = function() { 
        logger.info("chat not found");
        //TODO include error message to pass to view
        return res.json({
            error: true
        });
    };
    var success = function(chatJSON) {
        logger.info("chat found", chatJSON);
        //req.session.members[chatJSON.id] = chatJSON;
        //when redirected, the chat info will be cached
        new ChatSearchManager().incrementField(chatJSON.id, 'num_members', 1, function(err, result) {
            logger.info(result, '**** result from incrementing members in search ****');
        });
        return res.json({
            joined: true
        });
    };
    manager.joinChat(req.body.username, req.body.code, failure, success, chat_id);
});

router.post('/join_chat', function(req, res, next) {
    //TODO find a way to test this, since we are resetting members every time in the test
    //chat was not found
    var failure = function() { 
        logger.info("chat not found");
        return res.json({error: 'wrong password'});
        //TODO include error message to pass to view
    };
    var success = function(chatJSON) {
        //enter this function if chat was not joined before
        logger.info("chat found", chatJSON);
        res.status(200).json(chatJSON);
    };

    manager.joinChat(req.body.username, req.body.joinChat, failure, success);
});

router.post('/create_chat', function(req, res, next) {

    manager.createChat(req.body.username, req.body.createChat, function(chatInfo) {

        //req.session.members[chatInfo.id] = chatInfo;
        logger.debug(chatInfo, "****chat infofooo****");

        res.status(200).json(chatInfo);
    });
});

router.post('/remove_user', function(req, res, next) {
    var userManager = new UserManager(new UserCache(req.body.username));
    userManager.leave(req.body.chatID, function(rows) {
        //this was a huge bug, and why we need unit tests
        //delete req.session.members[req.body.chatID];

        new ChatSearchManager().incrementField(req.body.chatID, 'num_members', -1, function(err, result) {
            logger.info("*** removed a user from chat elasticsearch", result);
        });
        res.status(200).send({deleted: rows.affectedRows});
    });
});

function chatRender(req, res, missCB) {
    logger.info("post renderinfo not cached");

    manager.loadChat(req.query.username, req.params.chatID, function(deepCopy) {
        if(!deepCopy) {
            return missCB(null);
        }
        console.log(deepCopy);
        var infoDeepCopy = JSON.parse(JSON.stringify(deepCopy));
        missCB(infoDeepCopy);
    });
}

module.exports = router;
