var logger = require('../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var home = require('./home/home.js');
var chats = require('./chats/chats.js');
var users = require('./users/users.js');

module.exports = function(app) {
    app.use('/', router);

    //TODO test this extensively
    //FIXME check email verified middleware
    router.use('/api/home', home);
    router.use('/api/chats', chats);
    router.use('/api/users', users);
    //router.use('/api/search', search);
    //router.use('/api/images', images);

    return router;
};
