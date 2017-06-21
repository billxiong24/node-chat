var cache_store = require('./cache_store.js');


cache_store.on("error", function(err) {
    console.log("error : " + err);
});
function addValue(key, value, callback, expireTime = null) {
    if(!expireTime) {
        cache_store.set(key, value, callback);
    }
    else {
        cache_store.setex(key, expireTime, value, callback);
    }
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

module.exports = {
    addValue, 
    retrieveValue,
    addJSON,
    retrieveJSON,
    retrieveJSONElement
};
