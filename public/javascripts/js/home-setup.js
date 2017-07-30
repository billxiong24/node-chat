var SocketView = require('../viewmodel/socketview.js');
var ChatInfo = require('../viewmodel/chatinfo.js');
var ChatViewModel = require('../chatViewModel.js');

$(document).ready(function() {
    $.ajax({
        type: 'POST',
        data: JSON.stringify({
            _csrf: $('input[name=_csrf').val()
        }), 
        contentType: 'application/json',
        url: '/home/fetch_home',
        success: function(data) {
            /* set cookie on loading home page */
            Cookies.set('userid', data.cookie);
            sessionStorage.setItem('userid', data.cookie);
            //TODO set up other important information, such as chat lists
            var userid = sessionStorage.getItem('userid');
            setup(userid);
        },
        error: function(error) {
            console.log(error);
        }
    });

    function setup(userid) {
        var cvm = new ChatViewModel(userid, null, null);
        cvm.initChatNotifs(roomIDs, ChatInfo, SocketView);
    }
});
