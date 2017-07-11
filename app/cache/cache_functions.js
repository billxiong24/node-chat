var cache_store = require('./cache_store.js');
//const kue = require('kue');
var ProcessQueue = require('../workers/process_queue.js');

var pq = new ProcessQueue();

//all callbacks take err, result as parameters
function addValue(key, value, callback, expireTime = null) {
    if(!expireTime) {
        cache_store.set(key, value, callback);
    }
    else {
        cache_store.setex(key, expireTime, value, callback);
    }
}

function deleteKey(key, callback) {
    cache_store.del(key, callback);
}

function retrieveValue(key, callback) {
    cache_store.get(key, callback);
}

function addJSON(key, obj, callback) {
    cache_store.hmset(key, obj, callback);
}

function retrieveJSON(key, callback) {
    cache_store.hgetall(key, callback);
}

function retrieveJSONElement(key, element, callback) {
    cache_store.hget(key, element, callback);
}

function addJSONElement(key, element, value, callback) {
    cache_store.hset(key, element, value, callback);
}

//err, reply
function pushMessage(key, arr, callback) {
    var multi = cache_store.multi();
    var count = 0;
    
    arr.forEach(function(element) {
        count++;
        multi.lpush(key, element);
    });

    //process_queue.create('flush_message', {
        //chat_id: key,
        //num_messages: Math.floor(count/2)
    //}).priority('medium').attempts(3).save(function(err) {
        //if(!err) {
            //console.log("job saved");
        //}
    //});
    //
    pq.createJob('flush_message', {
        chat_id: key,
        num_messages: Math.floor(count/2)
    }, function(err) {
        if(err) { console.log(err); return; }
    }, 5);

    multi.exec(callback);
}

function popMessage(key, numMessages, callback) {
    var multi = cache_store.multi();
    for(var i = 0; i < numMessages; i++) {
        multi.rpop(key);
    } 

    multi.exec(callback);
}

function retrieveArray(key, start, end, callback) {
    cache_store.lrange(key, start, end, callback);
}


module.exports = {
    addValue, 
    retrieveValue,
    addJSON,
    retrieveJSON,
    retrieveJSONElement,
    addJSONElement,
    pushMessage,
    retrieveArray,
    popMessage,
    deleteKey,
    processQueue: pq
};
