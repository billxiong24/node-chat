$(document).ready(function() {
    
    $.ajax({
        type: 'POST',
        data: "", 
        contentType: 'application/json',
        url: '/home/fetch_home',
        success: function(data) {
            /* set cookie on loading home page */
            Cookies.set('userid', data.cookie);
            //TODO set up other important information, such as chat lists
            setup();
        }
    });


    var setup = function() {
        var client = io('/notifications');
        var ids = roomIDs;

        for (var i = 0; i < ids.length; i++) {
            client.emit('join', {room: ids[i].id});
        }

        client.on('notify', function(msg) {
            //someone else sent a notification
            if(msg.userid !== Cookies.get('userid')) {
                //TODO do stuff with msg.notif and msg.roomID
            }
        });
    }
})
