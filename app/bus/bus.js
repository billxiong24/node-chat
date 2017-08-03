//we need a publisher AND subscriber
var Redlock = require('redlock');
var redis = require("redis");

var Bus = function(publisher, subscriber, pubChannel, subChannel) {
    this._pub = publisher;
    this._sub = subscriber;
    this._subChannel = subChannel;
    this._pubChannel = pubChannel;
};

Bus.prototype.subToChannel= function(onMessage) {
    subscribeChannel(this._sub, this._subChannel, onMessage);
};

Bus.prototype.pubToChannel = function(message) {
    publishChannel(this._pub, this._pubChannel, message);
};

function publishChannel(client, channel, message) {
    client.publish(channel, message);
}

function subscribeChannel(client, channel, onMessage) {

    client.subscribe(channel);

    client.on('message', function(channel, message) {
        onMessage(channel, message);
    });
}

module.exports = Bus;
