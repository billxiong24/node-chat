require('dotenv').config({path: '../.env'});
var BusManager = require('../app/bus/bus_manager.js');
var redis = require('redis');
var ChatMicro = require('./chat_micro.js');

var ChatRequest = function(genClient) {
    ChatMicro.call(this, genClient);
};
ChatRequest.prototype = Object.create(ChatMicro.prototype);
ChatRequest.prototype.constructor = ChatRequest;

ChatRequest.prototype.loadChatListRequest = function(csrfToken, userObj, callback, chatID=null) {
    genListen.call(this, '_list_master', this._list_pub_channel, this._list_sub_channel, callback);
    var args = chatID ? [csrfToken, JSON.stringify(userObj), chatID] : [csrfToken, JSON.stringify(userObj)];

    publishChannel.call(this, this._list_master, 'loadChatListService', args);
};

ChatRequest.prototype.loadChatRequest = function(username, chatID, callback) {
    genListen.call(this, '_info_master', this._info_pub_channel, this._info_sub_channel, callback);
    publishChannel.call(this, this._info_master, 'loadChatService', [username, chatID]);
};

ChatRequest.prototype.createChatRequest = function(username, chatName, callback) {
    genListen.call(this, '_create_master', this._create_pub_channel, this._create_sub_channel, callback);
    publishChannel.call(this, this._create_master, 'createChatService', [username, chatName]);
};

ChatRequest.prototype.joinChatRequest = function(username, chatCode, callback) {
    genListen.call(this, '_join_master', this._join_pub_channel, this._join_sub_channel, callback);
    publishChannel.call(this, this._join_master, 'joinChatService', [username, chatCode]);
};

function publishChannel(publisher, method, args) {
    publisher.pubToChannel(JSON.stringify({
        method: method,
        args: args
    }));
}

function genListen(listener, pub_channel, sub_channel, callback) {
    var genClient = this._genClient;
    if(!this[listener]) {
        this[listener] = new BusManager(genClient(), genClient(),  pub_channel, sub_channel).getMaster();
    }
    this.listenBack(this[listener], callback);
}

module.exports = ChatRequest;
