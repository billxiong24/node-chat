var logger = require('../../util/logger.js')(module);
const connection = require('../database/config.js');
const crypto = require('crypto');
const sql = require('promise-mysql');
const line_render = require('./line_render.js');

var Line = require('../models/line.js');
var LineCache = require('../models/line_cache.js');
var Chat =  require('../models/chat.js');
var User =  require('../models/user.js');
var notifRender = require('./notif_render.js');

//TODO use async library to make things more asynchronous
//transfer everything using JSON to make transferring data uniform

var ChatManager = function ChatManager(chatobj) {
    this.chat_obj = chatobj;
};

ChatManager.prototype.loadChatLists = function (csrfToken, userObj, callback, chatID=null) {
    //TODO error checking
    var chatobj = new Chat();
    var user = new User(userObj.username, userObj.id, undefined, userObj.first, userObj.last);
    chatobj.loadLists(user, function(rows) {
        var userJSON = user.toJSON();
        //this is used for view rendering, will switch to clientside rendering soon

        var rowString = JSON.stringify(rows);
        userJSON.list = notifRender(JSON.parse(rowString));
        userJSON.parseList = encodeURIComponent(rowString);
        userJSON.csrfToken = csrfToken;

        var list = rows;
        var inSpecificChat = false;
        var members = {};
        //cache all chats in members
        for(var i = 0; i < list.length; i++) {
            if(chatID === list[i].id) {
                inSpecificChat = true;
            }
            members[list[i].id] = new Chat(list[i].id, list[i].chat_name, list[i].code)
                .toJSON(list[i].username, list[i].num_notifications, null);
        }

        logger.info('members after loading list', members);

        callback(userJSON, inSpecificChat, members);
    });
};

ChatManager.prototype.joinChat = function(username, chatCode, failure, success) {
    var chatobj = new Chat();
    //fake builder pattern again
    logger.info("joining code", chatCode);
    chatobj.setCode(chatCode);

    var sessionStore = function(chatobj) {
        return function(result) {
            if(result === null) {
                logger.debug("chat failed");
                //TODO error message
                //res.redirect('/home');
                failure();
                return null;
            }

            var chatobjJSON = chatobj.toJSON(username, 0, null);
            logger.debug("chat joined", chatobjJSON);
            success(chatobjJSON);
        };
    };
    chatobj.join(new User(username), sessionStore);
};

ChatManager.prototype.loadChat = function(username, chatID, callback) {

    var transport = function(chatObj, notifObj, lineObj) {
        return function(lineResults) {
            if(lineResults === null) {
                //TODO add error message here
                logger.debug("loading chat failed");
                callback(null);
                //res.redirect('/home');
                return null;
            }

            var info = chatObj.toJSON(username, notifObj.getNumNotifications(), null);
            callback(info);
        };
    };
    var chatobj = new Chat(chatID);
    chatobj.load(new User(username), transport);
};

ChatManager.prototype.loadLines = function(username, chatID, callback) {
    var chatobj = new Chat(chatID);

    var onLoad = function(lineResults) {
        if(lineResults === null) {
            logger.debug("load lines failed");
            res.redirect('/home');
            return null;
        }
        lineResults = line_render(username, lineResults).reverse();
        callback(lineResults);
    };

    chatobj.retrieveLines(onLoad);
};


//TODO Pass in callback here
ChatManager.prototype.createChat = function(username, chatName, callback) {
    var chatInfo = {
        id: crypto.randomBytes(8).toString('hex'),
        chat_name: chatName,
        code: crypto.randomBytes(3).toString('hex')
    };

    var chat = new Chat(chatInfo.id, chatInfo.chat_name, chatInfo.code);

    chat.insert(new User(username), function(result) {
        //just created chat, lines will be null
        var info = chat.toJSON(username, 0, null);
        logger.info("chat created successfully", info);
        callback(info);

    });

    return chatInfo;
};

ChatManager.prototype.loadMoreLines = function(username, chatID, lastTimeStamp, callback) {
    var line = new LineCache(chatID);
    line.readNext(lastTimeStamp, function(lineResults) {
        lineResults = lineResults !== null ? line_render(username, lineResults) : null;
        callback(lineResults);
    });
};

module.exports = ChatManager;
