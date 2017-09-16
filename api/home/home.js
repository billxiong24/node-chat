var express = require('express');
var logger = require('../../util/logger.js')(module);
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');

const CleanClient = require('../../app/cache/clean_client.js');
var ChatRequest = require('../../microservices/chat/chat_requester.js');
var NotifRequest = require('../../microservices/notifs/notif_request.js');
var ChatSearchManager = require('../../app/search/chat_search_manager.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

router.get('/', function(req, res, next) {
    var userObj = Object.assign({}, req.query);

    manager.loadChatLists(null, userObj, function(userJSON) {
        res.json(userJSON);
    });
});

module.exports = router;
