define(['socketview', 'notifview', 'lineview'], function(socketview, notifview, lineview) {
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
                var numMessages = $('.numMessages');

                this._socketview.addListener('online', function(data) {

                    if(!(data.user.id in that._userSockets)) {
                        that._userSockets[data.user.id] = data.user.username;
                        onlineList.append(renderList(data.user.username, data.user.id));
                        updateNumOnlineUsers(Object.keys(that._userSockets).length, numOnlineObj);
                        //this._notifview.getNotif will have been set in "connected" event
                        numMessages.text(that._notifview.getNotif());
                    }
                });

                this._socketview.addListener('connected', function(data) {
                    //if the socket response is you and not some other guy
                    if(that._userid === data.user.id) {
                        that._notifview.setNotif(data.notifs);
                    }
                    that._socketview.send('online', {});
                }); 

                this._socketview.addListener('disconnected', function(data) {
                    if(data.user.id in that._userSockets) { 
                        delete that._userSockets[data.user.id];
                    }
                    $('#'+data.user.id).remove();
                    updateNumOnlineUsers(Object.keys(that._userSockets).length, numOnlineObj);
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

                var viewUsername = (!that._lastMessage || that._lastMessage !== msg.cookie) ? msg.username : "";
                var viewStamp = "";

                var lineInfo = {
                    direction: dir,
                    //TODO fix dis
                    viewStamp: "",
                    viewUsername:  viewUsername, 
                    active: active,
                    message: msg.message
                };

                lineViewObj = new lineview.LineView(dir, viewStamp, active, viewUsername, msg.message);

                numMessages.text(that._notifview.getNotif());

                var message = displayLine(lineViewObj);
                that._lastMessage = msg.cookie;
            }

            return ChatView;
        })()
    };
});
