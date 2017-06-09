define(['socketview', 'notifview'], function(socketview, notifview) {
    return {
        ChatView: (function() {
            function ChatView(userid, socketview, notifview, userSockets={}) {
                this._userid = userid;
                this._lastMessage = null;
                this._notifview = notifview;
                this._socketview = socketview;
                this._userSockets = userSockets;

                this._socketview.joinRoom();
                this._socketview.connect();
            }

            ChatView.prototype.listenForOnlineUsers = function() {

                var that = this;
                this._socketview.addListener('connected', function(data) {
                    //if the socket response is you and not some other guy
                    if(that._userid === data.user.id) {
                        that._notifview.setNotif(data.notifs);
                    }
                    updateOnlineUsers(data);
                }); 

                this._socketview.addListener('disconnected', function(data) {
                    //delete userSockets[data.room.sockets[data.user.username]];
                    updateOnlineUsers(data);
                });
            };

            ChatView.prototype.setReceiveListener = function() {
                var that = this;
                this._socketview.addListener('message', function(msg) {
                    //holy shit this is bad- reset cookie if user deletes it lmao
                    displayMessage(that, msg, that._userid);
                });
            };

            ChatView.prototype.setSubmitListener = function() {
                var that = this;
                $('.submit-message').submit(function() {
                    var msg_input = $('.message-input');
                    if(msg_input.val().length > 0) {
                        that._socketview.send('message', msg_input.val());

                        that._notifview.sendNotification(that._userid);
                        msg_input.val("");
                    }
                    return false;
                });
                
            };

            function updateOnlineUsers(data) {
                var onlineList = $('.list-online');
                onlineList.empty();
                this._userSockets = {};
                onlineList.append($(displayOnlineUsers(data.room.sockets, data.user.username)));
            }

            function displayOnlineUsers(room, username) {
                var online = "";
                var size = 0;
                for(var key in room) {
                    if(room[key].userid in this._userSockets) {
                        continue;
                    }
                    online += '<div class="chat-user-name"> <input class = "btn online-list" style="" type="submit" name = "chatname" value="'+room[key].username+'"><img src="" id="'+room[key].userid +'"><div class="label-warning notif pull-right" style="">  </div> </div>';
                    //doesn't matter what value is
                    this._userSockets[room[key].userid] = null;
                    size++;
                }
                updateNumOnlineUsers(size);
                return online;
            }
            
            function updateNumOnlineUsers(num) {
                $('.online-now').text("Online now: " + num);
            }
            

            function displayMessage(that, msg, userid) {
                if(msg.message.length === 0) {
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
                    that._notifview.incrementNotif();
                }

                numMessages.text(that._notifview.getNotif());

                var message;
                if(!that._lastMessage || that._lastMessage !== msg.cookie) {
                    message = '<div class="'+dir+'"> <div class="author-name" id="mess"> <div class="date-chat">' + time + ' </div> <a class="author-name" href="#">' + msg.username + '</a> </div> <div class="chat-message '+active+'" style="text-align: left">' + msg.message + '</div> </div>';
                }
                else {
                    message = '<div class="'+dir+'">  <div class="chat-message '+active+'" style="text-align: left">' + msg.message + '</div> </div>';
                }
                
                that._lastMessage = msg.cookie;

                $('.chat-discussion').append($(message));
                $('.chat-discussion').scrollTop(200000);
            }

            return ChatView;
        })()
    };
});
