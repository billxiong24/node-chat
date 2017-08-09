const bluebird = require('bluebird');
const bcrypt = bluebird.promisifyAll(require('bcrypt-nodejs'));

function storePassword(password, callback, async=false) {
    if(!async) {
        bcrypt.hash(password, null, null, function(err, hash) {
            callback(err, hash);
        });
    }
    else {
        //no idea why empty callback has to be used, but its necessary for promise to work
        return bcrypt.hashAsync(password, null, function() {});
    }
}

function retrievePassword(password, hash, callback, async=false) {
    if(!async) {
        bcrypt.compare(password, hash, function(err, result) {
            callback(err, result);
        });
    }
    else {
        return bcrypt.compareAsync(password, hash);
    }
}

module.exports = {
    storePassword,
    retrievePassword
};

