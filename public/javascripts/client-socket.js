$(document).ready(function() {
    $('.chat-discussion').scrollTop(200000);

    var socketClient = (function() {
        var client = io();
        var lastMessage = null;
        
        //TODO abstract to object
        var userSockets = {};
        client.emit('join', {room: roomID});
        client.emit('connected');
        
        //this is ratchet af holy
        function resetCookie(callback, info) {
            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: '/home/fetch_home',
                success: function(data) {
                    /* reset cookie, bad idea */
                    Cookies.set('userid', data.cookie);
                    //TODO set up other important information, such as chat lists
                    //use promises here 

                    callback(info);
                }
            });
        }

        client.on('connected', function(data) {
            var userid = Cookies.get('userid');
            updateOnlineUsers(data);
        });

        client.on('disconnected', function(data) {
            //delete userSockets[data.room.sockets[data.user.username]];
            updateOnlineUsers(data);
        });

        client.on('connect', function(data) {
            //TODO NOTIFY client socket connected on frontend
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
            userSockets = {};
            onlineList.append($(displayOnlineUsers(data.room.sockets, data.user.username)));
        }
        function displayOnlineUsers(room, username) {
            var online = "";
            var size = 0;
            for(var key in room) {
                if(room[key] in userSockets) {
                    continue;
                }
                online += '<form class="change-chat" method = "post" action="change.php"> <div class="chat-user-name"> <input class = "btn online-list" style="" type="submit" name = "chatname" value="'+room[key]+'"> <div class="label-warning notif pull-right" style="">  </div> </div> </form>';
                //doesn't matter what value is
                userSockets[room[key]] = null;
                size++;

            }
            updateNumOnlineUsers(size);
            return online;
        }

        function displayMessage(msg) {
            if(msg.message.length == 0) {
                return;
            }

            var time = "";
            var dir;
            var active;
            var numMessages = $('.numMessages');

            if(msg.cookie === Cookies.get('userid')) {
                dir = "right";
                active = "active";
                numMessages.text(0);
            }
            else {
                dir = "left";
                active = "";
                numMessages.text(parseInt(numMessages.text()) + 1);
            }

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

        return client;
    })();
});
