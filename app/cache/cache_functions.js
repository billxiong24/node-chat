require('dotenv').config({path: __dirname + '../../.env'});
var logger = require('../../util/logger.js')(module);
var cache_store = require('./cache_store.js');
var ProcessQueue = require('../workers/process_queue.js');

//should only be 1 instance of this? singleton?
var pq = new ProcessQueue();

//all callbacks take err, result as parameters
function addValue(key, value, callback, expireTime = null) {
    //var cache_store = cache_arr[hashData(key)];

    if(!expireTime) {
        cache_store.set(key, value, callback);
    }
    else {
        cache_store.setex(key, expireTime, value, callback);
    }
}

function deleteKey(key, callback) {
    //var cache_store = cache_arr[hashData(key)];
    cache_store.del(key, callback);
}

function retrieveValue(key, callback) {
    //var cache_store = cache_arr[hashData(key)];
    cache_store.get(key, callback);
}

function addJSON(key, obj, callback, async=false) {
    //var cache_store = cache_arr[hashData(key)];
    if(!async) {
        cache_store.hmset(key, obj, callback);
    }
    else {
        return cache_store.hmset(key, obj);
    }
}

function retrieveJSON(key, callback, async=false) {
    //var cache_store = cache_arr[hashData(key)];
    if(!async) {
        cache_store.hgetall(key, callback);
    }
    else {
        return cache_store.hgetall(key).then(function(result) {
            if(!result || Object.keys(result).length === 0) {
                return false;
            }
            return result;
        });
    }
}

function retrieveJSONElement(key, element, callback, async=false) {
    //var cache_store = cache_arr[hashData(key)];
    if(!async) {
        cache_store.hget(key, element, callback);
    }
    else {
        return cache_store.hget(key, element);
    }
}

function removeJSONElement(key, element, callback, async=false) {
    //var cache_store = cache_arr[hashData(key)];
    if(!async) {
        cache_store.hdel(key, element, function(err, reply) {
            callback(err, reply);
        });
    }
    else {
        return cache_store.hdel(key, element);
    }
}

function addJSONElement(key, element, value, callback, async=false) {
    //if key does not exist, redis will create it, then insert value
    //var cache_store = cache_arr[hashData(key)];
    if(!async) {
        cache_store.hset(key, element, value, callback);
    }
    else {
        return cache_store.hset(key, element, value);
    }
}

//incr_by is any integer
function incrementJSONElement(key, element, incr_by, callback, async=false) {
    //var cache_store = cache_arr[hashData(key)];
    if(!async) {
        cache_store.hincrby(key, element, incr_by, function(err, result) {
            callback(err, result);
        });
    }
    else {
        return cache_store.hincrby(key, element, incr_by);
    }
}


//err, reply
function pushMessage(key, arr, callback) {
    //var cache_store = cache_arr[hashData(key)];
    var multi = cache_store.multi();
    
    arr.forEach(function(element) {
        multi.lpush(key, element);
    });
    //flush the cache if too many messages
    retrieveArray(key, 0, -1, function(err, arr) {
        //some randomass values
        if(arr.length < 10) {
            return;
        }
        var num_messages = arr.length;
        //Math.floor((arr.length + 4) / 2)

        pq.createJob('flush_message', {
            chat_id: key,
            num_messages:  num_messages
        }, function(err) {
            if(err) { 
                logger.error(err); 
                logger.debug("there was an error creating job");
                return; 
            }
        }, 4);
    });
    multi.exec(callback);
}

function popMessage(key, numMessages, callback) {
    //var cache_store = cache_arr[hashData(key)];
    var multi = cache_store.multi();
    for(var i = 0; i < numMessages; i++) {
        multi.rpop(key);
    } 

    multi.exec(function(err, message) {
        var messages = [];
        //we have to do this cuz for some reason, each message
        //is actually an array in the form of [null, message], for whatever fucking reason
        for (var i = 0, l = message.length; i < l; i++) {
            messages.push(JSON.parse(message[i][1]));
        }
        callback(err, messages);
    });
}

function retrieveArray(key, start, end, callback, async=false) {
    //var cache_store = cache_arr[hashData(key)];
    if(!async) {
        cache_store.lrange(key, start, end, callback);
    }
    else {
        return cache_store.lrange(key, start, end);
    }
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
    incrementJSONElement,
    removeJSONElement,
    processQueue: pq
};
