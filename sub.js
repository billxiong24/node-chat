var redis = require("redis");
var subscriber = redis.createClient();
var publisher = redis.createClient();

subscriber.on("message", function(channel, message) {
  console.log("mesage receieved in sub", message);
});

subscriber.subscribe("test");

//setInterval(function() {
    //publisher.publish('test', 'publish from sub');
//}, 2000);
