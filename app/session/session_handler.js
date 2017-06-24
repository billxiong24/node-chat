var cache_functions = require('../cache/cache_functions.js');

function handleSession(sessionID, callback) {
    cache_functions.retrieveValue('sess:'+ sessionID, function(err, value) {
        var sessObj = JSON.parse(value);
        callback(sessObj);
    });
}

function addToSession(sessionID, sessionObj, callback) {
    cache_functions.addValue('sess:'+sessionID, JSON.stringify(sessionObj), callback);
}

module.exports = {addToSession, handleSession};
