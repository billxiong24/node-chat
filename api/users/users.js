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
var user_manager;
if(!manager) {
    manager = new Manager(new Chat());
}
if(!user_manager) {
}

router.get('/stats', function(req, res, next) {
    var user_stat_manager = new UserStatManager(new UserStat(req.query.chat_id));
    logger.debug(req.query.chat_id);
    user_stat_manager.getStats(function(counts, result) {
        res.status(200).json({
            counts: counts,
            result: result
        });
    });
});

//needs extra middleware to check if user is trying to access another user's profile
//router.get('/:username', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    //manager.loadChatLists(req.csrfToken(), req.user, function(userJSON, inChat, members) {
        ////this is very bad
        //req.session.members = members;
        //userJSON.num_chats = userJSON.list.length;
        //if(process.env.NODE_ENV === 'test') {
            //return res.status(200).send(userJSON);
        //}
        //return res.render('settings-profile', userJSON);
    //});
//});

router.put('/:username/updatedInfo', function(req, res, next) {
    //var userManager = new UserManager(new UserCache(req.user.username).setJSON(req.user));
    //req.user will update automatically each request, no need to explicility set
    var user_manager = new UserManager(new UserCache(req.params.username, req.body.id));
    user_manager.updateUserProfile(req.body, function(rows, jsonObj) {
        if(!jsonObj) {
            return res.status(400).send('error');
        }
        res.status(200).send(jsonObj);
    });
});
router.put('/:username/updatedPassword', function(req, res, next) {
    var user_manager = new UserManager(new UserCache(req.params.username, req.body.id).setJSON(req.body));
    user_manager.updatePassword(req.body.old_password, req.body.new_password, function(rows) {
        res.status(200).send(rows);
    });
});


module.exports = router;
