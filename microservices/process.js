require('dotenv').config({path: __dirname + '/../.env'});
var ChatService = require('./chat/chat_service.js');
var NotifService = require('./notifs/notif_service.js');
var NotificationManager = require('../app/chat_functions/notif_manager.js');
var ChatManager = require('../app/chat_functions/chat_manager.js');
var redis = require('ioredis');

var redis_options = require('../app/cache/cache_config.js');


function start() {

    var host = process.env.HOST;
    var chatService = new ChatService(new ChatManager(null), function() {
        return new redis.Cluster(redis_options.clusters, redis_options.options);
    });

    chatService.listenService();
    var notifManager = new NotificationManager(null);
    var notifService = new NotifService(notifManager, function() {
        return new redis.Cluster(redis_options.clusters, redis_options.options);
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
