const bcrypt = require('bcrypt-nodejs');

function storePassword(password, callback) {
    bcrypt.hash(password, null, null, function(err, hash) {
        callback(err, hash);
    });
}

function retrievePassword(password, hash, callback) {
    bcrypt.compare(password, hash, function(err, result) {
        callback(err, result);
    });
}

module.exports = {
    storePassword,
    retrievePassword
};
