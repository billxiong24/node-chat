var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
const Manager = require('../../app/chat_functions/chat_manager.js');
const Chat =  require('../../app/models/chat.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

//needs extra middleware to check if user is trying to access another user's profile
router.get('/:username', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    manager.loadChatLists(req.csrfToken(), req.user, req.session.members, res, function(userJSON) {
        //this is very bad
        userJSON.email = req.user.email;
        userJSON.num_chats = userJSON.list.length;
        return res.render('settings-profile', userJSON);
    });
});


module.exports = router;
