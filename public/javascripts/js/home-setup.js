$(document).ready(function() {
    require(['jquery','socketview','chatinfo'], function($, socketview, chatinfo) {

        Handlebars.registerHelper('testhelp', function(list) {

        });

        $.ajax({
            type: 'POST',
            data: "", 
            contentType: 'application/json',
            url: '/home/fetch_home',
            success: function(data) {
                /* set cookie on loading home page */
                Cookies.set('userid', data.cookie);
                sessionStorage.setItem('userid', data.cookie);
                //TODO set up other important information, such as chat lists
                var userid = sessionStorage.getItem('userid');
                setup(userid, $, chatinfo, socketview);
            }
        });
    });

    function setup(userid, $, chatinfo, socketview) {
        var inf = new chatinfo.ChatInfo(new socketview.SocketView(null, '/notifications'), roomIDs, userid);

        inf.listenForNotifications(function(data) {
            if(data.userid !== sessionStorage.getItem('userid')) {
                $('#'+data.roomID + ' span').text(inf.incrementGetNotif(data.roomID));
            }

            else {
                inf.resetGetNotif(data.roomID);
                $('#'+data.roomID + ' span').text(""); 
            }
        });
    }
});
