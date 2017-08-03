var redis = require("redis");
var subscriber = redis.createClient();
var publisher  = redis.createClient();

subscriber.on("message", function(channel, message) {
  console.log(message, "in pub");
});

subscriber.subscribe("test");

setInterval(function() {
    publisher.publish('test', 'FROM PUB PUBLISHING');
}, 2000);
