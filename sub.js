var redis = require("redis");
var subscriber = redis.createClient();
var publisher = redis.createClient();
var BusManager = require('./app/bus/bus_manager.js');

var bus = new BusManager(subscriber, publisher, 'pubChannel', 'subChannel').getService();

bus.subToChannel(function(channel, message) {
    console.log("mesage receieved in sub", message);
    bus.pubToChannel('wowzaa');
});

//setInterval(function() {
    //publisher.publish('test', 'publish from sub');
//}, 2000);
