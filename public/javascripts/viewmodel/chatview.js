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

            ChatView.prototype.listenForOnlineUsers = function(onlineList, numOnlineObj, renderList) {

                var that = this;
                this._socketview.addListener('connected', function(data) {
                    //if the socket response is you and not some other guy
                    if(that._userid === data.user.id) {
                        that._notifview.setNotif(data.notifs);
                    }
                    updateOnlineUsers(data, onlineList, numOnlineObj, renderList);
                }); 

                this._socketview.addListener('disconnected', function(data) {
                    //delete userSockets[data.room.sockets[data.user.username]];
                    updateOnlineUsers(data, onlineList, numOnlineObj, renderList);
                });
            };

            ChatView.prototype.setReceiveListener = function(displayLine) {
                var that = this;
                this._socketview.addListener('message', function(msg) {
                    //holy shit this is bad- reset cookie if user deletes it lmao
                    displayMessage(that, msg, that._userid, displayLine);
                });
            };

            ChatView.prototype.setSubmitListener = function(submitForm, messageInput) {
                var that = this;
                submitForm.submit(function() {
                    var msg_input = messageInput;
                    if(msg_input.val().length > 0) {
                        that._socketview.send('message', msg_input.val());

                        that._notifview.sendNotification(that._userid);
                        msg_input.val("");
                    }
                    return false;
                });
                
            };

            function updateOnlineUsers(data, onlineList, numOnlineObj, renderList) {
                onlineList.empty();
                this._userSockets = {};
                onlineList.append($(displayOnlineUsers(data.room.sockets, data.user.username, numOnlineObj, renderList)));
            }
            
            function displayOnlineUsers(room, username, numOnlineObj, renderList) {
                var online = "";
                var size = 0;
                for(var key in room) {
                    if(room[key].userid in this._userSockets) {
                        continue;
                    }

                    online += renderList(room[key].username, room[key].userid);
                    //doesn't matter what value is
                    this._userSockets[room[key].userid] = null;
                    size++;
                }
                updateNumOnlineUsers(size, numOnlineObj);
                return online;
            }
            
            function updateNumOnlineUsers(num, numOnlineObj) {
                numOnlineObj.text("Online now: " + num);
            }
            

            function displayMessage(that, msg, userid, displayLine) {
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
                var ownUser = !that._lastMessage || that._lastMessage !== msg.cookie;
                var message = displayLine(dir, ownUser, msg.username, time, active, msg.message);
                that._lastMessage = msg.cookie;
            }

            return ChatView;
        })()
    };
});
