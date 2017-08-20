var logger = require('../../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');

var ChatSearchManager = require('../../app/search/chat_search_manager.js');


router.get('/', authenticator.checkLoggedOut, function(req, res, next) {
    var csm = new ChatSearchManager();
    

    csm.search(req.query.query, 0, function(err, result) {
        res.status(200).json(result);
    });


});

module.exports = router;
