$(document).ready(function() {
    //TODO fix this
    $('.chat-discussion').scrollTop(200000);

    //TODO oop this

    
    var socketClient = (function() {
        var client = io();
        var notifClient = io('/notifications');
        var typing = io('/typing');

        var isTyping = false;
        var lastMessage = null;
        var notifications = null;
        var timer = null;
        
        //TODO abstract to object
        var userSockets = {};
        client.emit('join', {room: roomID});
        typing.emit('join', {room: roomID});
        client.emit('connected');
        
        function timeoutTyping() {
            isTyping = false;
            typing.emit('typing', {
                userid: Cookies.get('userid'),
                roomID: roomID,
                isTyping: isTyping 
            });
        }

        //this is ratchet af holy
        function resetCookie(callback, info, info2) {
            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: '/home/fetch_home',
                success: function(data) {
                    /* reset cookie, bad idea */
                    Cookies.set('userid', data.cookie);
                    //TODO set up other important information, such as chat lists
                    //use promises here 

                    callback(info, info2);
                    sendNotification(info, info2);
                }
            });
        }

        client.on('connected', function(data) {
            var userid = Cookies.get('userid');
            //if the socket response is you and not some other guy
            if(userid === data.user.id) {
                notifications = data.notifs;
            }
            updateOnlineUsers(data);
        });

        client.on('disconnected', function(data) {
            //delete userSockets[data.room.sockets[data.user.username]];
            updateOnlineUsers(data);
        });

        typing.on('typing', function(data) {
            var userEl = $('#'+data.userid);
            if(data.isTyping) {
                userEl.attr('src', '/images/typing.gif');
            }
            else {
                resetTyping(data.userid);
            }
        });


        $('.submit-message').keyup(function() {
            if(!isTyping) {
                isTyping = true;
                typing.emit('typing', {
                    userid: Cookies.get('userid'),
                    roomID: roomID,
                    isTyping: isTyping
                });
            }
            clearTimeout(timer);
            timer = setTimeout(timeoutTyping, 700);
        });

        $('.submit-message').submit(function() {
            var msg_input = $('.message-input');
            var userid = Cookies.get('userid');
            if(msg_input.val().length > 0) {
                client.emit('message', msg_input.val());
                sendNotification(userid);
                msg_input.val("");
            }
            return false;
        });

        client.on('message', function(msg) {
            //holy shit this is bad- reset cookie if user deletes it lmao
            var userid = Cookies.get('userid');
            if(!userid) {
                resetCookie(displayMessage, msg, userid);
            }
            else {
                displayMessage(msg, userid);
            }
        });

        function resetTyping(userid) {
            $('#'+userid).attr('src', "");
        }

        function sendNotification(userid) {

            notifications = 0;
            notifClient.emit('notify', {
                userid: userid,
                notif: notifications,
                roomID: roomID
            });
        }
        
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
                if(room[key].userid in userSockets) {
                    continue;
                }
                online += '<div class="chat-user-name"> <input class = "btn online-list" style="" type="submit" name = "chatname" value="'+room[key].username+'"><img src="" id="'+room[key].userid +'"><div class="label-warning notif pull-right" style="">  </div> </div>';
                //doesn't matter what value is
                userSockets[room[key].userid] = null;
                size++;

            }
            updateNumOnlineUsers(size);
            return online;
        }

        function displayMessage(msg, userid) {
            if(msg.message.length == 0) {
                return;
            }

            var numMessages = $('.numMessages');

            var time = "";
            var dir;
            var active;

            if(msg.cookie === userid){
                dir = "right";
                active = "active";
            }
            else {
                dir = "left";
                active = "";
                notifications++;
            }

            numMessages.text(notifications);

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
