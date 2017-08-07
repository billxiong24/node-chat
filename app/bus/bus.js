//we need a publisher AND subscriber
var Redlock = require('redlock');
var redis = require("redis");

var Bus = function(publisher, subscriber, pubChannel, subChannel) {
    this._pub = publisher;
    this._sub = subscriber;
    this._subChannel = subChannel;
    this._pubChannel = pubChannel;
};

Bus.prototype.getSubChannel = function() {
    return this._subChannel;
};

Bus.prototype.getPubChannel = function() {
    return this._pubChannel;
    
};

Bus.prototype.subToChannel= function(onMessage) {
    subscribeChannel(this._sub, this._subChannel, onMessage);
};

Bus.prototype.unSubToChannel = function() {
    this._sub.unsubscribe(this._subChannel);
    this._pub.unsubscribe(this._pubChannel);
    this._sub.unsubscribe(this._pubChannel);
    this._pub.unsubscribe(this._subChannel);
};

Bus.prototype.pubToChannel = function(message, callback) {
    publishChannel.call(this, this._pub, this._pubChannel, message, callback);
};

function publishChannel(client, channel, message, callback) {
    var that = this;
    client.publish(channel, message, function() {
        //that.unSubToChannel();
    });
}

function subscribeChannel(client, channel, onMessage) {

    client.subscribe(channel);

    client.on('message', function(channel, message) {
        onMessage(channel, message);
    });
}

module.exports = Bus;
