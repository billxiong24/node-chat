require('dotenv').config({path: '../../.env'});
var NotifMicro = require('./notif_micro.js');

var NotifRequest = function(genClient) {
    NotifMicro.call(this, genClient);
};

NotifRequest.prototype = Object.create(NotifMicro.prototype);
NotifRequest.prototype.constructor = NotifRequest;

NotifRequest.prototype.loadNotificationRequest = function(chatID, username, callback) {
    this.genListen('_load_master', this._load_pub_channel, this._load_sub_channel, callback);
    this.publishChannel(this._load_master, 'loadNotificationService', [chatID, username]);
};

NotifRequest.prototype.flushNotificationRequest = function(chatID, username, callback) {
    this.genListen('_flush_master', this._flush_pub_channel, this._flush_sub_channel, callback);
    this.publishChannel(this._flush_master, 'flushNotificationService', [chatID, username]);
};

//NotifRequest.prototype.finish = function() {
    //this._load_master.unSubToChannel();
//};

module.exports = NotifRequest;
