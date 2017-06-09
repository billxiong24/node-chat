$(document).ready(function() {
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
            setup(sessionStorage.getItem('userid'));
        }
    });

    function setup(userid) {
        var SocketView = socketview($, io);
        var ChatInfo = chatinfo($, io);
        var inf = new ChatInfo(new SocketView(null, '/notifications'), roomIDs, userid);

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
