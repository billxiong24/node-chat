$(document).ready(function() {

    (function() {
        var client = io();
        var lastMessage = null;
        client.emit('join', {room: roomID});
        client.emit('connected', "test");
        
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

        client.on('connected', function(data) {
            console.log(data.room.sockets);
            console.log(data.user.username);
            console.log(data.room.length);
            updateOnlineUsers(data);
            updateNumOnlineUsers(data.room.length);
        });

        client.on('disconnected', function(data) {
            updateOnlineUsers(data);
            updateNumOnlineUsers(data.room.length);
        });

        client.on('connect', function(data) {
            //TODO NOTIFY client socket connected on frontend
            console.log("clientside connect");
            //var online = $('<form class="change-chat" method = "post" action="change.php"> <div class="chat-user-name"> <input class = "btn online-list" style="" type="submit" name = "chatname" value="Username"> <div class="label-warning notif" style="">5</div> </div> </form>');
            //$('.list-online').append(online);
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
        
        function updateNumOnlineUsers(num) {
            $('.online-now').text("Online now: " + num);
        }
        function updateOnlineUsers(data) {
            var onlineList = $('.list-online');
            onlineList.empty();
            var online = displayOnlineUsers(data.room.sockets, data.user.username);
            onlineList.append($(online));
        }
        function displayOnlineUsers(room, username) {
            var online = "";
            for(var obj in room) {
                online += '<form class="change-chat" method = "post" action="change.php"> <div class="chat-user-name"> <input class = "btn online-list" style="" type="submit" name = "chatname" value="useruser"> <div class="label-warning notif pull-right" style="">5</div> </div> </form>';
            }
            return online;
        }

        function displayMessage(msg) {
            var time = "test time";
            var dir = (msg.cookie === Cookies.get('userid')) ? "right" : "left";
            var active = (msg.cookie === Cookies.get('userid')) ? "active" : "";

            var message;
            if(!lastMessage || lastMessage !== msg.cookie) {
                message = '<div class="'+dir+'"> <div class="author-name" id="mess"> <div class="date-chat">'
                    + time + ' </div> <a class="author-name" href="#">'
                    + msg.username + '</a> </div> <div class="chat-message '+active+'" style="text-align: left">' 
                    + msg.message + '</div> </div>';
            }
            else {
                message = '<div class="'+dir+'">  <div class="chat-message '+active+'" style="text-align: left">' 
                        + msg.message + '</div> </div>';
            }
            
            lastMessage = msg.cookie;

            $('.chat-discussion').append($(message));
            $('.chat-discussion').scrollTop(200000);
        }
    })();
});
