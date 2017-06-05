$(document).ready(function() {
    
    var notifObj = {};
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
            notifObj[ids[i].id] = ids[i].num_notifications
            client.emit('join', {room: ids[i].id});
        }

        client.on('notify', function(msg) {
            //someone else sent a notification
            if(msg.userid !== Cookies.get('userid')) {
                $('#'+msg.roomID + ' span').text(++notifObj[msg.roomID]);
            }
            else {
                notifObj[msg.roomID] = 0;
                $('#'+msg.roomID + ' span').text("");
            }
        });
    }
})
