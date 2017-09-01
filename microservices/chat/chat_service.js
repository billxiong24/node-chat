require('dotenv').config({path: __dirname + '/../../.env'});

var BusManager = require('../../app/bus/bus_manager.js');
var ChatManager = require('../../app/chat_functions/chat_manager.js');
var ChatMicro = require('./chat_micro.js');

var ChatService = function(chat_manager, genClient) {
    ChatMicro.call(this, genClient);
    this._chat_manager = chat_manager;
    this.init();
};

ChatService.prototype = Object.create(ChatMicro.prototype);
ChatService.prototype.constructor = ChatService;

ChatService.prototype.listenService = function() {

    this.listen(this._list_service);
    this.listen(this._info_service);
    this.listen(this._create_service);
    this.listen(this._join_service);
};

ChatService.prototype.loadChatListService = function(csrfToken, userObj, chatID=null) {
    var that = this;
    //TODO error check for null
    userObj = JSON.parse(userObj);

    this._chat_manager.loadChatLists(csrfToken, userObj, function(userJSON, inSpecificChat, members) {
        var obj = {};
        obj.userJSON = userJSON;
        obj.members = members;
        obj.inChat = inSpecificChat;

        that._list_service.pubToChannel(JSON.stringify(obj));
    }, chatID);
};

ChatService.prototype.loadChatService = function(username, chatID) {
    var that = this;
    this._chat_manager.loadChat(username, chatID, function(info) {
        that._info_service.pubToChannel(JSON.stringify(info));
    });
};

ChatService.prototype.createChatService = function(username, chatName) {
   var that = this;
    this._chat_manager.createChat(username, chatName, function(info) {
        that._create_service.pubToChannel(JSON.stringify(info));
    });
};

ChatService.prototype.joinChatService = function(username, chatCode, chatID=null) {
    var that = this;

    var fail = function() {
        that._join_service.pubToChannel(JSON.stringify({
            join_error: true
        }));
    };
    var success = function(chatJSON) {
        that._join_service.pubToChannel(JSON.stringify(chatJSON));
    };

    this._chat_manager.joinChat(username, chatCode, fail, success, chatID);
};


module.exports = ChatService;
