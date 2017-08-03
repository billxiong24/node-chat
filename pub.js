var redis = require("redis");
var Bus = require('./app/bus/bus.js');
var BusManager = require('./app/bus/bus_manager.js');

var subscriber = redis.createClient();
var publisher = redis.createClient();
var bus = new BusManager(publisher, subscriber, 'pubChannel', 'subChannel').getMaster();

bus.subToChannel(function(channel, message) {
    console.log("received a message from "+channel, message);
});
bus.pubToChannel('starting');


//setInterval(function() {
    //bus.pubPublishChannel('test', 'from pub publishing');
//}, 2000);
