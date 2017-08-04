var redis = require("redis");
var Bus = require('./app/bus/bus.js');
var BusManager = require('./app/bus/bus_manager.js');

var subscriber = redis.createClient();
var publisher = redis.createClient();
var bus = new BusManager(publisher, subscriber, 'pub_chat_list', 'sub_chat_list').getMaster();

bus.pubToChannel(JSON.stringify({
    csrfToken: 'test',
    userObj: {
        id: '123',
        username: 'asdf',
        first: 'babab',
        last: 'dfdf'
    }
}));

bus.subToChannel(function(channel, message) {
    console.log("sending it back", message);

});
//var bus2 = new BusManager(publisher, subscriber, 'pub2', 'sub2').getMaster();

//bus.subToChannel(function(channel, message) {
    //console.log("received a message from "+channel, message);
//});

//bus2.subToChannel(function(channel, message) {
    //console.log("hey");
//});

//bus.pubToChannel(JSON.stringify({
    //test: 'a',
    //test2: 'b'
//}));

//setInterval(function() {
    //bus.pubPublishChannel('test', 'from pub publishing');
//}, 2000);
