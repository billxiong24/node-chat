var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');
var PicManager = require('../../app/chat_functions/pic_manager.js');
var Pic = require('../../app/models/pic.js');


router.get('/user_profile', function(req, res, next) {
    var userid = req.query.userid;
    var picManager = new PicManager(new Pic());

    picManager.loadImage(userid).then(function(data) {
        res.json(data);
    });
});

module.exports = router;
