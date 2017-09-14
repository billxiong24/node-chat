var logger = require('../../util/logger.js')(module);
var express = require('express');
var router = express.Router();
var authenticator = require('../../app/authentication/user-pass.js');

var ChatSearchManager = require('../../app/search/chat_search_manager.js');


//TODO Figuire this shit out
router.get('/', authenticator.checkLoggedOut, function(req, res, next) {
    var csm = new ChatSearchManager();
    var members = req.session.members;
    

    csm.search(req.query.query, 0, function(err, result) {
        result.hits.forEach(function(element) {

            if(members[element._source.id]) {
                logger.debug("**** already member of this search chat ****", element._source.chat_name);
                element._source.member = true;
            }
        });

        return res.status(200).json(result);
    });


});

module.exports = router;
