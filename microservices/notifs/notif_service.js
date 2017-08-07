require('dotenv').config({path: __dirname + '/../../.env'});
//console.log(process.env.HOST);
//console.log(process.env.NODE_USER);
//console.log(process.env.PASS);
var BusManager = require('../../app/bus/bus_manager.js');
var NotificationManager = require('../../app/chat_functions/notif_manager.js');
var Notification = require('../../app/models/notification.js');
var redis = require('redis');
var NotifMicro = require('./notif_micro.js');


var NotifService = function(notifManager, genClient) {
    NotifMicro.call(this, genClient);
    this._notif_manager = notifManager;
    this.init();
};

NotifService.prototype = Object.create(NotifMicro.prototype);
NotifService.prototype.constructor = NotifService;

NotifService.prototype.listenService = function() {
    this.listen(this._flush_service);
    this.listen(this._load_service);
};

NotifService.prototype.flushNotificationService = function(chatID, username) {
    var that = this;
    this._notif_manager.setNotification((new Notification(chatID, username, -1)));
    this._notif_manager.flushNotifications(function(result) {
        that._flush_service.pubToChannel(JSON.stringify(result));
    });
};

NotifService.prototype.loadNotificationService = function(chatID, username) {
    var that = this;
    this._notif_manager.setNotification((new Notification(chatID, username, -1)));
    this._notif_manager.loadNotifications(function(result) {
        that._load_service.pubToChannel(JSON.stringify(result));
    });
};

var notifManager = new NotificationManager(null);

var notifService = new NotifService(notifManager, function() {
    return redis.createClient();
});
notifService.listenService();

module.exports = NotifService;
