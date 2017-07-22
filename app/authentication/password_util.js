const bluebird = require('bluebird');
const bcrypt = bluebird.promisifyAll(require('bcrypt-nodejs'));

function storePassword(password, callback) {
    bcrypt.hash(password, null, null, function(err, hash) {
        callback(err, hash);
    });
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
