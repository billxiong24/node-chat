require('dotenv').config({path: '../../.env'});
var BusManager = require('../../app/bus/bus_manager.js');
var NotificationManager = require('../../app/chat_functions/notif_manager.js');
var Notification = require('../../app/models/notification.js');
var redis = require('redis');
var NotifMicro = require('./notif_micro.js');


var NotifService = function(notif_manager, genClient) {
    NotifMicro.call(this, genClient);
    this._notif_manager = notif_manager;
    this.init();
};

NotifService.prototype = Object.create(NotifMicro.prototype);
NotifService.prototype.constructor = NotifService;

NotifService.prototype.listenService = function() {
   this.listen(this._flush_service); 
   this.listen(this._load_service); 
};

NotifService.prototype.flushNotificationService = function() {
    var that = this;
    this._notif_manager.flushNotifications(function(result) {
        that._flush_service.pubToChannel(JSON.stringify(result));
    });
};

NotifService.prototype.loadNotificationService = function() {
    var that = this;
    this._notif_manager.loadNotifications(function(result) {
        that._load_service.pubToChannel(JSON.stringify(result));
    });
};

NotifService.prototype.setNotifManager = function(notifManager) {
    this._notif_manager = notifManager;
};

var notifManager = new NotificationManager(new Notification('0043e138f3a1daf9ccfbf718fc9acd48', 'gerrymander', -1));

var notifService = new NotifService(notifManager, function() {
    return redis.createClient();
});

notifService.listenService();

module.exports = NotifService;
