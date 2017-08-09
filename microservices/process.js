require('dotenv').config({path: __dirname + '/../.env'});
var ChatService = require('./chat/chat_service.js');
var NotifService = require('./notifs/notif_service.js');
var NotificationManager = require('../app/chat_functions/notif_manager.js');
var ChatManager = require('../app/chat_functions/chat_manager.js');
var redis = require('ioredis');


function start() {

    var host = process.env.HOST;
    var chatService = new ChatService(new ChatManager(null), function() {
        return new redis.Cluster([
            {
                port: 6379,
                host: host
            },
            {
                port: 6380,
                host: host
            },
            {
                port: 6381,
                host: host
            }

        ], {
            scaleReads: 'slave',
            enableOfflineQueue: true
        });
    });

    chatService.listenService();
    var notifManager = new NotificationManager(null);
    var notifService = new NotifService(notifManager, function() {
        return new redis.Cluster([
            {
                port: 6379,
                host: host
            },
            {
                port: 6380,
                host: host
            },
            {
                port: 6381,
                host: host
            }

        ], {
            scaleReads: 'slave',
            enableOfflineQueue: true
        });
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
