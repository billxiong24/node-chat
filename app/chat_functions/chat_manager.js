const connection = require('../database/config.js');
const crypto = require('crypto');
const sql = require('promise-mysql');
const line_render = require('./line_render.js');

var Line = require('../models/line.js');
var Chat =  require('../models/chat.js');
var User =  require('../models/user.js');
var notifRender = require('./notif_render.js');

//TODO use async library to make things more asynchronous
//transfer everything using JSON to make transferring data uniform

var ChatManager = (function() {

    function ChatManager(chatobj) {
        this.chat_obj = chatobj;
    }

    ChatManager.prototype.loadChatLists = function (csrfToken, userObj, res) {
        //TODO error checking
        var chatobj = new Chat();
        var user = new User(userObj.username, undefined, undefined, userObj.first, userObj.last);
        chatobj.loadLists(user, function(rows) {
            var userJSON = user.toJSON();
            //this is used for view rendering, will switch to clientside rendering soon
            userJSON.parseList = encodeURIComponent(JSON.stringify(notifRender(rows)));
            
            userJSON.list = rows;
            userJSON.csrfToken = csrfToken;
            res.render('home', userJSON);
        });
    };

    ChatManager.prototype.joinChat = function(username, chatCode, req, res) {
        var chatobj = new Chat();
        //fake builder pattern again
        chatobj.setCode(chatCode);

        var sessionStore = function(chatobj) {
            return function(result) {
                if(result === null) {
                    //TODO error message
                    res.redirect('/home');
                    return null;
                }
                //TODO FIX THIS SHIT
                req.session.members[chatobj.getID()] = chatobj.toJSON(username, 0, null);
                res.redirect('/chats/' + chatobj.getID());
            };
        };
        chatobj.join(new User(username), sessionStore);
    };

    ChatManager.prototype.loadChat = function(username, chatID, req, res) {

        var transport = function(chatObj, notifObj, lineObj) {
            return function(lineResults) {
                if(lineResults === null) {
                    //TODO add error message here
                    res.redirect('/home');
                    return null;
                }

                var info = chatObj.toJSON(username, notifObj.getNumNotifications(), null);
                req.session.members[info.id] = info;
                res.render('chat', info);
            };
        };
        var chatobj = new Chat(chatID);
        chatobj.load(new User(username), transport);
    };

    ChatManager.prototype.loadLines  = function(username, chatID, req, res) {
        var chatobj = new Chat(chatID);

        var onLoad = function(lineResults) {
            if(lineResults === null) {
                res.redirect('/home');
                return null;
            }
            lineResults = line_render(username, lineResults);
            req.session.lastTimeStamp = lineResults.length > 0 ? lineResults[0].stamp : null;
            console.log(req.session.lastTimeStamp + " on load tmee");
            res.status(200).send({lines: lineResults});
        };
        chatobj.retrieveLines(onLoad);
    };

    
    ChatManager.prototype.createChat = function(username, chatName, req, res) {
        var chatInfo = {
            id: crypto.randomBytes(8).toString('hex'),
            chat_name: chatName,
            code: crypto.randomBytes(3).toString('hex')
        };

        var chat = new Chat(chatInfo.id, chatInfo.chat_name, chatInfo.code);

        chat.insert(new User(username), function(result) {
            //just created chat, lines will be null
            var info = chat.toJSON(username, 0, null);

            req.session.members[chat.getID()] = info;
            res.redirect('/chats/' + chat.getID());
        });

        return chatInfo;
    };

    ChatManager.prototype.loadMoreLines = function(username, chatID, lastTimeStamp, req, res) {
        var line = new Line(chatID);
        line.readNext(req.session.lastTimeStamp, function(lineResults) {
            lineResults = lineResults !== null ? line_render(username, lineResults) : null;

            console.log(req.session.lastTimeStamp + " BEFORE");
            req.session.lastTimeStamp = (lineResults !== null && lineResults.length > 0) ?  lineResults[0].stamp : null;
            console.log(req.session.lastTimeStamp + "after");

            if(req.session.lastTimeStamp !== null) {
                res.status(200).json({lines: lineResults, username: username});
                res.end();
            }
            else {
                res.status(200).json({lines: null});
                res.end();
            }
        });
        
    };

    return ChatManager;
})();


module.exports = ChatManager;
