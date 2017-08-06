var BusManager = require('../app/bus/bus_manager.js');

var Service = function(genClient) {
    this._genClient = genClient;
};

//supposed to overriden
Service.prototype.init = function() {
    
};

Service.prototype.genListen = function(listener, pub_channel, sub_channel, callback) {
    var genClient = this._genClient;
    if(!this[listener]) {
        //console.log("hi", listener);
        this[listener] = new BusManager(genClient(), genClient(),  pub_channel, sub_channel).getMaster();
    }
    this.listenBack(this[listener], callback);
};

Service.prototype.publishChannel = function(publisher, method, args) {
    publisher.pubToChannel(JSON.stringify({
        method: method,
        args: args
    }));
};


Service.prototype.listenBack = function(service, callback) {
    var that = this;
    var prototype = Object.getPrototypeOf(this);

    service.subToChannel(function(channel, message) {
        //in case we get message from wrong channel, shouldnt happen
        if(channel !== service.getSubChannel()) {
            console.log("wrong channel");
            return;
        }

        var json = JSON.parse(message);
        callback(channel, json);

    });
};
Service.prototype.listen = function(service) {
    var that = this;
    var prototype = Object.getPrototypeOf(this);

    service.subToChannel(function(channel, message) {
        //in case we get message from wrong channel, shouldnt happen
        if(channel !== service.getSubChannel()) {
            console.log("wrong channel");
            return;
        }
        var json = JSON.parse(message);
        console.log(json.method);
        console.log(json.args);

        if(!prototype[json.method]) {
            console.log("method does not exist");
            return;
        }
        prototype[json.method].apply(that, json.args);
    });
};

module.exports = Service;
