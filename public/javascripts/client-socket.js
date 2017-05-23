$(document).ready(function() {

    /* fetch all the data needed for home screen here */
    var client = io();
    client.emit('join', {room: roomID});
    
    //this is ratchet af holy
    function resetCookie(callback, info) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: 'http://localhost:3000/home/fetch_home',
            success: function(data) {
                /* reset cookie, bad idea */
                Cookies.set('userid', data.cookie);
                //TODO set up other important information, such as chat lists
                callback(info);
            }
        });
    }

    client.on('connect', function() {
        //TODO NOTIFY client socket connected on frontend
        console.log("clientside connect");
    });

    $('.submit-message').submit(function() {
        var msg_input = $('.message-input');
        client.emit('message', msg_input.val());
        msg_input.val("");
        return false;
    });

    client.on('message', function(msg) {
        //holy shit this is bad- reset cookie if user deletes it lmao
        if(!Cookies.get('userid')) {
            resetCookie(displayMessage, msg);
        }
        else {
            displayMessage(msg);
        }
    });
    
    function displayMessage(msg) {
        var time = "test time";
        var dir = (msg.cookie === Cookies.get('userid')) ? "right" : "left";
        var active = (msg.cookie === Cookies.get('userid')) ? "active" : "";

        var message = '<div class="'+dir+'"> <div class="author-name" id="mess"> <div class="date-chat">'
                + time + ' </div> <a class="author-name" href="#">'
                + msg.username + '</a> </div> <div class="chat-message '+active+'" style="text-align: left">' 
                + msg.message + '</div> </div>';

        $('.chat-discussion').append($(message));
        $('.chat-discussion').scrollTop(200000);
    }

});
