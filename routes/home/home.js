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

router.get('/', authenticator.checkLoggedOut, function(req, res, next) {
    /* set all cookies here */
    //prevent user from manipulating cookie with browser javascript 
    res.cookie('userid', req.session.user.id, {
        httpOnly: true,
        secure: true
    });

    var clean_client = new CleanClient();
    var chatRequester = new ChatRequest(clean_client.genClient());

    chatRequester.loadChatListRequest(req.csrfToken(), req.user, function(channel, json) {
        logger.debug(json.userJSON);

        clean_client.cleanup();
        req.session.members = json.members;
        if(process.env.NODE_ENV=== 'test') {
            res.status(200).json(json.userJSON);
        }
        else {
            res.render('home', json.userJSON);
        }
    });
});

/* POST request for fetching all data needed for home page */
router.post('/fetch_home', authenticator.checkLoggedOut, function(req, res, next) {
    /* send all relevant data here */
    res.status(200).json({cookie: req.session.user.id});
});

module.exports = router;
