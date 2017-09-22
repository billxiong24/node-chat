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
var client_request = require('../../api/client_request.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}
router.get('/:chatID', authenticator.checkLoggedOut, function(req, res, next) {
    client_request.get({
        url: '/api/chats/'+req.params.chatID,
        params: req.user
    }).then(function(response) {
        req.session.members = response.data.members;
        if(process.env.NODE_ENV === 'test') {
            if(!response.data.inSpecificChat) {
                return res.redirect('/home');
            }
            return res.status(200).json(response.data.userJSON);
        }
        if(!response.data.inSpecificChat) {
            return res.redirect('/home');
        }
        //dont forget csrftoken
        response.data.userJSON.csrfToken = req.csrfToken();
        res.render('groupchat', response.data.userJSON);
    });
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
        deepCopy.csrfToken = req.csrfToken();
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

router.put('/:chatID/updatedName', authenticator.checkLoggedOut, function(req, res, next) {
    client_request.put({
        url: '/api/chats/' + req.params.chatID + '/updatedName',
        data: {
            newName: req.body.newName
        }
    }).then(function(response) {
        res.status(200).send(response.data);
    });
});

router.put('/:chatID/updatedCode', authenticator.checkLoggedOut, function(req, res, next) {
    client_request.put({
        url: '/api/chats/' + req.params.chatID + '/updatedCode',
        data: {
            newCode: req.body.newCode
        }
    }).then(function(response) {
        res.status(200).send(response.data);
    });
});

router.post('/:chatID/newDescription', authenticator.checkLoggedOut, function(req, res, next) {
    //axios({
        //method: 'post',
        //baseURL: 'http://localhost/',
        //url: '/api/chats/' + req.params.chatID + '/updatedName',
        //data: {
            //newName: req.body.newName
        //},
        //proxy: {
            //host: 'localhost',
            //port: 5000
        //}
    //}).then(function(response) {
        //res.status(200).send({
            //success: true
        //});
    //});
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
    client_request.post({
        url: '/api/chats/verify_chat',
        data: {
            username: req.session.user.username,
            code: code,
            chat_id: chat_id
        }
    }).then(function(response) {
        return res.json(response.data);
    });
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
    client_request.post({
        url: '/api/chats/join_chat',
        data: {
            username: req.session.user.username,
            joinChat: req.body.joinChat
        }
    }).then(function(response) {
        if(response.data.error) {
            if(process.env.NODE_ENV === 'test') {
                return res.json({error: 'wrong password'});
            }
            res.redirect('/home');
        }
        else {
            if(process.env.NODE_ENV == 'test') {
                return res.json({joined: true});
            }
            new ChatSearchManager().incrementField(response.data.id, 'num_members', 1, function(err, result) {
                logger.info(result, '**** result from incrementing members in search ****');
            });
            logger.info(response.data, 'FROM JOIN CHAT POST');
            res.redirect('/chats/'+response.data.id);
        }
    });
});

router.post('/create_chat', authenticator.checkLoggedOut, function(req, res, next) {
    client_request.post({
        url: '/api/chats/create_chat',
        data: {
            username: req.session.user.username,
            createChat: req.body.createChat
        }
    }).then(function(response) {
        new ChatSearchManager().createDocument(response.data, function(err, res) {
            logger.info("added document to index after creating chat", res);
        });
        return res.redirect('/chats/' + response.data.id);
    });
});

router.post('/remove_user', authenticator.checkLoggedOut, function(req, res, next) {
    client_request.post({
        url: '/api/chats/remove_user',
        data: {
            username: req.session.user.username,
            chatID: req.body.chatID
        }
    }).then(function(response) {
        delete req.session.members[req.body.chatID];
        logger.debug(req.session.members);
        return res.send(response.data);
    });
});

function chatRender(req, res, cachedCB, missCB) {
    if(req.params.chatID in req.session.members) {
        logger.info("post renderinfo cached");
        req.session.members[req.params.chatID].csrfToken = req.csrfToken();
        //req.session.members[req.params.chatID].notifs = numNotifs;
        cachedCB(req.session.members);
    }
    else {
        //this code will never get reached, but its good to have options
        client_request.get({
            url: '/api/chats/'+req.params.chatID + '/renderInfo',
            params: {
                username: req.session.user.username
            }
        }).then(function(response) {
            console.log("reached callback");
            missCB(response.data);
        });
    }
}

module.exports = router;
