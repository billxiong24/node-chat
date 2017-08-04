require('dotenv').config({path: '../.env'});
var BusManager = require('../app/bus/bus_manager.js');
var ChatManager = require('../app/chat_functions/chat_manager.js');
var redis = require('redis');

var ChatService = function(chat_manager, publisher, subscriber) {
    this._chat_manager = chat_manager;

    initChannels.call(this);
    var busManager = new BusManager(publisher, subscriber, this._pub_channel, this._sub_channel);

    this._service = busManager.getService();
};

//ChatService.prototype.getRequester = function() {
    //return this._master;
//};

ChatService.prototype.getServicer = function() {
    return this._service;
};

ChatService.prototype.listen = function() {
    var that = this;
    this._service.subToChannel(function(channel, message) {
        if(channel !== that._pub_list_channel) {
            console.log("wrong channel");
            return;
        }
        var json = JSON.parse(message);
        var csrfToken = json.csrfToken;
        var userObj = json.userObj;
        var chatID = json.chatID ? json.chatID : null;
        console.log(json);
        //that._service.pubToChannel(JSON.stringify(json));
        that.loadChatListService(csrfToken, userObj, chatID);
    });
};

ChatService.prototype.loadChatListService = function(csrfToken, userObj, chatID=null) {
    var that = this;

    this._chat_manager.loadChatLists(csrfToken, userObj, function(userJSON, inSpecificChat, members) {
        var obj = userJSON;
        obj.members = members;
        console.log("hiiidy");

        that._service.pubToChannel(JSON.stringify(obj));
    }, chatID);
};

function initChannels() {
    this._pub_list_channel = 'pub_chat_list';
    this._sub_list_channel = 'sub_chat_list';

    this._pub_join_channel = 'pub_join_channel';
    this._sub_join_channel = 'sub_join_channel';

    this._pub_load_channel = 'pub_load_channel';
    this._sub_load_channel = 'sub_load_channel';

    this._pub_loadlines_channel = 'pub_loadlines_channel';
    this._sub_loadlines_channel = 'sub_loadlines_channel';

    this._pub_create_channel = 'pub_create_channel';
    this._sub_create_channel = 'sub_create_channel';

    this._pub_loadmore_channel = 'pub_loadmore_channel';
    this._sub_loadmore_channel = 'sub_loadmore_channel';
}


var chatService = new ChatService(new ChatManager(null), redis.createClient(), redis.createClient());
chatService.listen();

module.exports = ChatService;
