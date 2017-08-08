require('dotenv').config({path: __dirname + '/../../.env'});
var ChatMicro = require('./chat_micro.js');

var ChatRequest = function(genClient) {
    ChatMicro.call(this, genClient);
};

ChatRequest.prototype = Object.create(ChatMicro.prototype);
ChatRequest.prototype.constructor = ChatRequest;

ChatRequest.prototype.loadChatListRequest = function(csrfToken, userObj, callback, chatID=null) {
    this.genListen('_list_master', this._list_pub_channel, this._list_sub_channel, callback);
    var args = chatID ? [csrfToken, JSON.stringify(userObj), chatID] : [csrfToken, JSON.stringify(userObj)];

    this.publishChannel(this._list_master, 'loadChatListService', args);
};

ChatRequest.prototype.loadChatRequest = function(username, chatID, callback) {
    this.genListen('_info_master', this._info_pub_channel, this._info_sub_channel, callback);
    this.publishChannel(this._info_master, 'loadChatService', [username, chatID]);
};

ChatRequest.prototype.createChatRequest = function(username, chatName, callback) {
    this.genListen('_create_master', this._create_pub_channel, this._create_sub_channel, callback);
    this.publishChannel(this._create_master, 'createChatService', [username, chatName]);
};

ChatRequest.prototype.joinChatRequest = function(username, chatCode, callback) {
    this.genListen('_join_master', this._join_pub_channel, this._join_sub_channel, callback);
    this.publishChannel(this._join_master, 'joinChatService', [username, chatCode]);
};

module.exports = ChatRequest;
