$(document).ready(function() {
    require(['jquery','socketview','chatinfo', 'chatviewmodel'], function($, socketview, chatinfo, chatviewmodel) {

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
                setup(userid, $, chatinfo, socketview, chatviewmodel);
            },
            error: function(error) {
                console.log(error);
            }
        });
    });

    function setup(userid, $, chatinfo, socketview, chatviewmodel) {
        var cvm = new chatviewmodel.ChatViewModel(userid, null, null);
        cvm.initChatNotifs(roomIDs, chatinfo, socketview);
    }
});
