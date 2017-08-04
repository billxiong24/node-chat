var Bus = require('./bus.js');

var BusManager = function(publisher, subscriber, pubChannel, subChannel) {
    this._pub = publisher;
    this._sub = subscriber;
    this._subChannel = subChannel;
    this._pubChannel = pubChannel;
    return this;
};

BusManager.prototype.getMaster = function() {
    return new Bus(this._pub, this._sub, this._pubChannel, this._subChannel);
};

BusManager.prototype.getService = function() {
    return new Bus(this._pub, this._sub, this._subChannel, this._pubChannel);
};

module.exports = BusManager;
