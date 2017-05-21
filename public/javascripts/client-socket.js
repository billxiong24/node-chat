$(document).ready(function() {

    /* fetch all the data needed for home screen here */
    $.ajax({
        type: 'POST',
        data: "", 
        contentType: 'application/json',
        url: 'http://localhost:3000/home/fetch_home',
        success: function(data) {
            /* set cookie on loading home page */
            Cookies.set('userid', data.cookie);

            //TODO set up other important information, such as chat lists
        }
    });
    var client = io();

    client.emit('join', {room: "room1"});
    $('.submit-message').submit(function() {
        var msg_input = $('.message-input')
        client.emit('message', msg_input.val());
        msg_input.val("");
        return false;
    });
    client.on('message', function(msg) {
        var time = "test time";

        var dir = (msg.cookie === Cookies.get('userid')) ? "right" : "left";

        var message = '<div class="'+dir+'"> <div class="author-name" id="mess"> <div class="date-chat">'
                + time + ' </div> <a class="author-name" href="#">'
                + msg.username + '</a> </div> <div class="chat-message active" style="text-align: left">' 
                + msg.message + '</div> </div>';

        $('.chat-discussion').append($(message));
        $('.chat-discussion').scrollTop(200000);
    });

});
