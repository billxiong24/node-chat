var redis = require("redis");
var subscriber = redis.createClient();
var publisher = redis.createClient();
var BusManager = require('./app/bus/bus_manager.js');

var bus = new BusManager(subscriber, publisher, 'pubChannel', 'subChannel').getService();
var bus2 = new BusManager(subscriber, publisher, 'pub2', 'sub2').getService();

bus.subToChannel(function(channel, message) {
    console.log("mesage receieved in sub", message, channel);
    //var json = JSON.parse(message);
    bus.pubToChannel(message);
});
//bus2.subToChannel(function(channel, message) {
    //if(channel == 'pub2') {
        //console.log("mesage receieved in sub222", message, channel);
        //bus2.pubToChannel('try this');
    //}
    //else {
        //console.log("get lost");
    //}
//});

//setInterval(function() {
    //publisher.publish('test', 'publish from sub');
//}, 2000);
