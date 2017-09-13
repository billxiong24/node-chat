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
        //HACK need to refactor this shit
        //to avoid caching image in case user changes prof pic
        userJSON.email = userObj.email; 
        userJSON.url = !userObj.url ? undefined : userObj.url + '?'+ new Date().getTime();

        var rowString = JSON.stringify(rows);
        var notifRes = notifRender(JSON.parse(rowString));
        userJSON.list = notifRes.notifs;
        userJSON.total_notifs = notifRes.num_not_zero;
        userJSON.parseList = encodeURIComponent(rowString);
        userJSON.csrfToken = csrfToken;

        var list = rows;
        var inSpecificChat = false;
        var members = {};
        userJSON.creator = null;
        //cache all chats in members
        for(var i = 0; i < list.length; i++) {
            if(chatID === list[i].id) {
                logger.debug('FOUND THE SPECIFIC CHAT --------------------------------');
                inSpecificChat = true;
                userJSON.creator = list[i].creator;
            }
            members[list[i].id] = new Chat(list[i].id, list[i].chat_name, list[i].code)
                .toJSON(list[i].username, list[i].num_notifications, null);
            //FIXME add to part of JSON
            members[list[i].id].creator = list[i].creator;
            members[list[i].id].description = list[i].description;
        }
        callback(userJSON, inSpecificChat, members);
    });
};

ChatManager.prototype.joinChat = function(username, chatCode, failure, success, chatID=null) {
    var chatobj = new Chat();
    //fake builder pattern again
    if(chatID) {
        chatobj.setID(chatID);
    }
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
            chatobjJSON.description = result.description;
            chatobjJSON.creator = result.creator;
            success(chatobjJSON);
        };
    };
    if(!chatID) {
        chatobj.join(new User(username), sessionStore);
    }
    else {
        chatobj.join(new User(username), sessionStore, true);
    }
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
        info.creator = 1;
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

ChatManager.prototype.changeCode = function(id, newCode, callback) {
    var chat = new Chat(id);
    chat.updateCode(newCode, function(rows) {
        callback(rows);
    });
};

ChatManager.prototype.changeName = function(id, newName, callback) {
    var chat = new Chat(id);
    chat.updateName(newName, function(rows) {
        callback(rows);
    });
    
};

ChatManager.prototype.changeDescription = function(id, description, callback) {
    var chat = new Chat(id);
    chat.addDescription(description, function(rows) {
        callback(rows);
    });
};


module.exports = ChatManager;
