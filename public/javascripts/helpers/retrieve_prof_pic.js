var chatAjaxService = require('../service/chatAjaxService.js');

module.exports = function (imgObj, userid) {
    return chatAjaxService.chatAjaxPromise('/images/user_profile', 'GET', {
        userid: userid
    }).then(function(data) {
        console.log(data.url);
        imgObj.attr('src', data.url);
    });
};
