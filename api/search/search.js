var logger = require('../../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
var Manager = require('../../app/chat_functions/chat_manager.js');
var Chat = require('../../app/models/chat.js');

var ChatSearchManager = require('../../app/search/chat_search_manager.js');


//TODO Figuire this shit out
router.get('/', function(req, res, next) {
    var members = req.query.members;
    manager = new Manager(new Chat());

    var userJSON = {
        username: req.query.username
    };

    //give client chance to pass in previously acquired members from session??
    if(members) {
        logger.debug('memebrs was defined in request');
        search(req, res, members);
    }
    else {
        manager.loadChatLists(null, userJSON, function(userJSON, inS, members) {
            search(req, res, members);
        });
    }
});


function search(req, res, members) {
    var csm = new ChatSearchManager();
    csm.search(req.query.query, 0, function(err, result) {
        result.hits.forEach(function(element) {
            if(members && members[element._source.id]) {
                logger.debug("**** already member of this search chat ****", element._source.chat_name);
                element._source.member = true;
            }
        });
        return res.status(200).json(result);
    });
}

module.exports = router;
