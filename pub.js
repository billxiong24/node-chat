var redis = require("redis");
var Bus = require('./app/bus/bus.js');
var BusManager = require('./app/bus/bus_manager.js');
var ChatRequest = require('./microservices/chat_requester.js');

var subscriber = redis.createClient();
var publisher = redis.createClient();

var chatRequester = new ChatRequest(function() {
    return redis.createClient();
});

chatRequester.loadChatRequest('rhee', '019274b44a472600', function(channel, json) {
    console.log('from info', json);
});

chatRequester.joinChatRequest('marquis', 'qmxq', function(channel, json) {
    console.log("from join", json);
});

chatRequester.createChatRequest('user55', 'microchat', function(channel, json) {
    console.log("from created", json);
});

var userObj = {
    id: 45,
    username: 'billxiong24',
    first: 'Bill',
    last: 'Xiong' 
};
chatRequester.loadChatListRequest('123456', userObj, function(channel, json) {
    console.log("from created", json);
});

//var bus = new BusManager(publisher, subscriber, 'info_pub_channel', 'info_sub_channel').getMaster();
//var bus2 = new BusManager(redis.createClient(), redis.createClient(), 'join_pub_channel', 'join_sub_channel').getMaster();
//var bus3 = new BusManager(redis.createClient(), redis.createClient(), 'create_pub_channel', 'create_sub_channel').getMaster();

//bus.subToChannel(function(channel, message) {
    //console.log("sending it back", message);
//});
//bus2.subToChannel(function(channel, message) {
    //console.log("sending it backbus222222", message);
//});
//bus3.subToChannel(function(channel, message) {
    //console.log("sending it backbus33", message);
//});


//bus.pubToChannel(JSON.stringify({
    //method : 'loadChatService',
    //args : ['js12', '019274b44a472600']
//}));

//bus3.pubToChannel(JSON.stringify({
    //method : 'createChatService',
    //args : ['marquis', 'chatchat']
//}));

//bus2.pubToChannel(JSON.stringify({
    //method : 'joinChatService',
    //args : ['marquis', 'qmxq']
//}));
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
