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
                //to be determined
                this._socketID = null; 
                this._ownSocketIDs = {};
            }

            ChatView.prototype.listenForOnlineUsers = function(onlineList, numOnlineObj, renderList) {

                var that = this;
                var numMessages = $('.numMessages');

                this._socketview.addListener('online', function(data) {
                    if(data.user.id === that._userid) {
                        //if i connect, and new term is > -1, then another tab is connected
                        console.log("sent by ", data.socketID);
                        console.log("another term, own term", data.term, that._userSockets[data.user.id]);
                    }

                    if(!(data.user.id in that._userSockets)) {
                        //first request, socket id must be own
                        that._socketID = data.socketID;

                        that._userSockets[data.user.id] = 1;
                        onlineList.append(renderList(data.user.username, data.user.id));
                        updateNumOnlineUsers(Object.keys(that._userSockets).length, numOnlineObj);
                        //this._notifview.getNotif will have been set in "connected" event
                        numMessages.text(that._notifview.getNotif());
                    }
                    else if(that._socketID !== data.socketID && !(data.socketID in that._ownSocketIDs)){ //some other tab has opened
                        console.log("wait");
                        that._ownSocketIDs[data.socketID] = null;
                        that._userSockets[data.user.id]++;
                    }

                    //how many of same users are in the same chat
                    console.log("own uesrs ", that._userSockets[data.user.id]);
                });

                this._socketview.addListener('connected', function(data) {
                    //if the socket response is you and not some other guy
                    if(that._userid === data.user.id) {
                        that._notifview.setNotif(data.notifs);
                    }
                    var term = (data.user.id in that._userSockets) ? that._userSockets[data.user.id] : -1;
                    that._socketview.send('online', {
                        term: term
                    });
                }); 

                this._socketview.addListener('disconnected', function(data) {
                    console.log("disconnecting, ", that._socketID, data.socketID);
                    if(data.user.id in that._userSockets && that._socketID !== data.socketID) { 
                        that._userSockets[data.user.id]--;
                        console.log("own usersin loop: ", that._userSockets[data.user.id]);
                        if(that._userSockets[data.user.id] === 0) {
                            delete that._userSockets[data.user.id];
                            $('#'+data.user.id).remove();
                        }
                    }
                    console.log("own users: ", that._userSockets[data.user.id]);
                    updateNumOnlineUsers(Object.keys(that._userSockets).length, numOnlineObj);
                });
            };

            ChatView.prototype.setReceiveListener = function(displayLine) {
                var that = this;
                this._socketview.addListener('message', function(msg) {
                    //holy shit this is bad- reset cookie if user deletes it lmao
                    displayMessage(that, msg, that._userid, displayLine);
                    //that._notifview.sendNotification(that._userid);
                });
            };

            ChatView.prototype.setSubmitListener = function(textareaObj, submitForm) {
                var that = this;
                var textobj = textareaObj;
                submitForm.submit(function(event) {
                    var message = textobj.val().trim();
                    textobj.val('');
                    if(message.length > 0) {
                        that._socketview.send('message', message);
                        that._notifview.sendNotification(that._userid);
                    }
                    return false;
                });
                textobj.keyup(function(event) {
                    var message = textobj.val();
                    if(event.keyCode == 13) {
                        submitForm.submit();
                    }
                });
            };

            function updateNumOnlineUsers(num, numOnlineObj) {
                numOnlineObj.text(num);
            }
            
            //this message is cancerous
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
                //that._notifview.cacheNotification(userid);

                var message = displayLine(lineViewObj);
                that._lastMessage = msg.cookie;
            }

            return ChatView;
        })()
    };
});
