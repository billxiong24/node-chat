var cache_functions = require('../cache/cache_functions.js');

function handleSession(sessionID, callback) {
    cache_functions.retrieveValue('sess:'+ sessionID, function(err, value) {
        var sessObj = JSON.parse(value);
        console.log(sessObj);

        callback(sessObj);
    });
}

module.exports = {handleSession};
