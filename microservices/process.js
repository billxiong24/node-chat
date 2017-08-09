require('dotenv').config({path: __dirname + '/../.env'});
var ChatService = require('./chat/chat_service.js');
var NotifService = require('./notifs/notif_service.js');
var NotificationManager = require('../app/chat_functions/notif_manager.js');
var ChatManager = require('../app/chat_functions/chat_manager.js');
var redis = require('redis');


function start() {

    var chatService = new ChatService(new ChatManager(null), function() {
        return redis.createClient();
    });

    chatService.listenService();
    var notifManager = new NotificationManager(null);
    var notifService = new NotifService(notifManager, function() {
        return redis.createClient();
    });
    notifService.listenService();
}

function stop() {
    process.exit();
}

module.exports = {
    stop: stop,
    start: start
};
