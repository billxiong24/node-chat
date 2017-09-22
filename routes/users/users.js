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
var client_request = require('../../api/client_request.js');

var manager;
if(!manager) {
    manager = new Manager(new Chat());
}

router.get('/stats', authenticator.checkLoggedOut, function(req, res, next) {
    client_request.get({
        url: '/api/users/stats',
        params: {
            chat_id: req.query.chat_id
        }
    }).then(function(response) {
        res.status(200).json(response);
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


router.put('/:username/updatedInfo', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    //req.user will update automatically each request, no need to explicility set
    client_request.put({
        url: '/api/users/'+req.params.username + '/updatedInfo',
        data: req.body
    }).then(function(response) {
        var jsonObj = response.data;
        if(!jsonObj || jsonObj.affectedRows === 0) {
            return res.status(400).send('error');
        }
        var url = req.session.user.url;
        req.session.user = jsonObj;
        req.session.user.url = url;
        logger.info(req.session.user, "updated req session put request");
        res.status(200).send('done');
    });
});

router.put('/:username/updatedPassword', authenticator.checkLoggedOut, authenticator.checkOwnUser, function(req, res, next) {
    client_request.put({
        url: '/api/users/' + req.params.username + '/updatedPassword',
        data: {
            old_password: req.body.old_password,
            new_password: req.body.new_password
        }
    }).then(function(response) {
        logger.debug(response.data, 'CHANGED PASSWORD');
        res.status(200).send(response.data);
    });
});


module.exports = router;
