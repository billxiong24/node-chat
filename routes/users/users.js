var logger = require('../../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');
const UserCache = require('../../app/models/user_cache.js');
const UserManager = require('../../app/models/user_manager.js');
var UserRequest = require('../../microservices/user/user_request.js');
var CleanClient = require('../../app/cache/clean_client.js');
var UserStatManager = require('../../app/chat_functions/user_stat_manager.js');
var UserStat = require('../../app/models/user_stat.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

router.get('/stats', authenticator.checkLoggedOut, function(req, res, next) {
    var user_stat_manager = new UserStatManager(new UserStat(req.query.chat_id));
    logger.debug('in stats');
    logger.debug(req.query.chat_id);
    user_stat_manager.getStats(function(counts, result) {

        res.status(200).json({
            counts: counts,
            result: result
        });
    });
});

//needs extra middleware to check if user is trying to access another user's profile
router.get('/:username', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    manager.loadChatLists(req.csrfToken(), req.user, function(userJSON, inChat, members) {
        //this is very bad
        req.session.members = members;
        userJSON.email = req.user.email;
        userJSON.num_chats = userJSON.list.length;
        if(process.env.NODE_ENV === 'test') {
            return res.status(200).send(userJSON);
        }
        return res.render('settings-profile', userJSON);
    });
});


router.put('/:username/updatedInfo', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    var clean_client = new CleanClient();
    var userRequest = new UserRequest(clean_client.genClient());
    //var userManager = new UserManager(new UserCache(req.user.username).setJSON(req.user));
    //req.user will update automatically each request, no need to explicility set
    userRequest.updateUserProfileRequest(req.body, req.user, function(channel, jsonObj) {
        if(!jsonObj || !jsonObj.jsonObj || jsonObj.affectedRows === 0) {
            return res.status(400).send('error');
        }
        req.session.user = jsonObj.jsonObj;
        logger.info(req.session.user, "updated req session put request");
        clean_client.cleanup();
        res.status(200).send('done');
    });
});

router.put('/:username/updatedPassword', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    var clean_client = new CleanClient();
    var userRequest = new UserRequest(clean_client.genClient());
    userRequest.updatePasswordRequest(req.user, req.body.old_password, req.body.new_password, function(channel, jsonObj) {
        logger.debug('updated password', jsonObj);
        res.status(200).send(jsonObj);
        clean_client.cleanup();
    });
});


module.exports = router;
