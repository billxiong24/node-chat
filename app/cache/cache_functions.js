var cache_store = require('./cache_store.js');
var ProcessQueue = require('../workers/process_queue.js');

//should only be 1 instance of this? singleton?
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

function retrieveJSON(key, callback, async=false) {
    if(!async) {
        cache_store.hgetall(key, callback);
    }
    else {
        return cache_store.hgetallAsync(key);
    }
}

function retrieveJSONElement(key, element, callback, async=false) {
    if(!async) {
        cache_store.hget(key, element, callback);
    }
    else {
        return cache_store.hgetAsync(key, element);
    }
}

function addJSONElement(key, element, value, callback, async=false) {
    //if key does not exist, redis will create it, then insert value
    if(!async) {
        cache_store.hset(key, element, value, callback);
    }
    else {
        return cache_store.hsetAsync(key, element, value);
    }
}

//incr_by is any integer
function incrementJSONElement(key, element, incr_by, callback, async=false) {
    if(!async) {
        cache_store.hincrby(key, element, incr_by, function(err, result) {
            callback(err, result);
        });
    }
    else {
        return cache_store.hincrbyAsync(key, element, incr_by);
    }
}


//err, reply
function pushMessage(key, arr, callback) {
    var multi = cache_store.multi();
    
    arr.forEach(function(element) {
        multi.lpush(key, element);
    });

    
    //flush the cache if too many messages
    retrieveArray(key, 0, -1, function(err, arr) {
        //some randomass values
        if(arr.length < 9) {
            return;
        }

        pq.createJob('flush_message', {
            chat_id: key,
            num_messages: Math.floor((arr.length + 4) / 2)
        }, function(err) {
            if(err) { console.log(err); return; }
        }, 5);
    });
    multi.exec(callback);
}

function popMessage(key, numMessages, callback) {
    var multi = cache_store.multi();
    for(var i = 0; i < numMessages; i++) {
        multi.rpop(key);
    } 

    multi.exec(callback);
}

function retrieveArray(key, start, end, callback, async=false) {
    if(!async) {
        cache_store.lrange(key, start, end, callback);
    }
    else {
        return cache_store.lrangeAsync(key, start, end);
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
    processQueue: pq
};
