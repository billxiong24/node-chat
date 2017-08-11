var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');
const UserCache = require('../../app/models/user_cache.js');
const UserManager = require('../../app/models/user_manager.js');

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
    var userManager = new UserManager(new UserCache(req.user.username).setJSON(req.user));
    userManager.updateUserProfile(req.body, req.session.user, function(rows) {
        res.status(200).send('done');
    });
});

router.put('/:username/updatedPassword', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    var userManager = new UserManager(new UserCache(req.user.username).setJSON(req.user));
    userManager.updatePassword(req.body.old_password, req.body.new_password, function(result) {
        res.status(200).send({changed: result});
    });
});


module.exports = router;
