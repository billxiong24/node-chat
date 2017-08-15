var logger = require('../../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');
const UserCache = require('../../app/models/user_cache.js');
const UserManager = require('../../app/models/user_manager.js');
var UserRequest = require('../../microservices/user/user_request.js');
var clean_client = require('../../app/cache/clean_client.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

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
    var clients = [];
    var userRequest = new UserRequest(clean_client.genClient(clients));
    //var userManager = new UserManager(new UserCache(req.user.username).setJSON(req.user));
    //req.user will update automatically each request, no need to explicility set
    userRequest.updateUserProfileRequest(req.body, req.user, function(channel, jsonObj) {
        if(!jsonObj || !jsonObj.jsonObj || jsonObj.affectedRows === 0) {
            return res.status(400).send('error');
        }
        req.session.user = jsonObj.jsonObj;
        logger.info(req.session.user, "updated req session put request");
        clean_client.cleanup(clients);
        res.status(200).send('done');
    });
    //userManager.updateUserProfile(req.body, function(rows, jsonObj) {
        //if(!jsonObj) {
            //return res.status(400).send('error');
        //}
        //req.session.user = jsonObj;
        //logger.info(req.session.user, "updated req session put request");
        //res.status(200).send('done');
    //});
});

router.put('/:username/updatedPassword', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    var clients = [];
    var userRequest = new UserRequest(clean_client.genClient(clients));
    userRequest.updatePasswordRequest(req.user, req.body.old_password, req.body.new_password, function(channel, jsonObj) {
        logger.debug('updated password', jsonObj);
        res.status(200).send(jsonObj);
        clean_client.cleanup(clients);
    });
    //var userManager = new UserManager(new UserCache(req.user.username).setJSON(req.user));
    //userManager.updatePassword(req.body.old_password, req.body.new_password, function(result) {
        //res.status(200).send({changed: result});
    //});
});


module.exports = router;
