var cache_store = require('./cache_store.js');

cache_store.on("error", function(err) {
    console.log("error : " + err);
});

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

//err, reply
function pushMessage(key, arr, callback) {
    var multi = cache_store.multi();
    
    arr.forEach(function(element) {
        multi.lpush(key, element);
    });

    multi.exec(callback);
}

function popMessage(key, callback) {
    cache_store.rpop(key, callback);
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
    pushMessage,
    retrieveArray,
    popMessage,
    deleteKey
};
