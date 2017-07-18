define(['socketview', 'notifview'], function(socketview, notifview) {
    return {
        OnlineView: (function(socketview, notifview) {
            function OnlineView(userid, socketview, notifview) {
                this._userid = userid;
                this._notifview = notifview;
                this._socketview = socketview;
                this._userSockets = {};
                this._connectedSockets = {};

                //to be determined
                this._username = "";
                this._nativeSocketID = null;
                this._socketID = generateID(); 
                this._ownSocketIDs = {};
                this._ownSocketIDs[this._socketID] = null;

            }

            OnlineView.prototype.getConnectedSockets = function() {
                return this._connectedSockets;    
            };

            OnlineView.prototype.getUsername = function() {
                return this._username;    
            };

            OnlineView.prototype.listenForOnlineUsers = function(onlineList, numOnlineObj, renderList) {
                var that = this;

                //TODO numMessages should be extracted from here
                var numMessages = $('.numMessages');
                this._socketview.addListener('online', function(data) {
                    //its my specific socket
                    if(data.user.id === that._userid && that._socketID === data.socketID) {
                        //if i connect, and new term is > -1, then another tab is connected
                        that._nativeSocketID = data.nativeSocketID;
                        that._username = data.user.username;
                        console.log("set native socket id ", that._nativeSocketID);
                    }

                    if(!(data.user.id in that._userSockets)) {
                        //TODO clean this up
                        that._connectedSockets[data.user.id] = data.nativeSocketID;
                        console.log(that._connectedSockets);

                        that._userSockets[data.user.id] = 1;
                        onlineList.append(renderList(data.user.username, data.user.id));
                        updateNumOnlineUsers(Object.keys(that._userSockets).length, numOnlineObj);
                        //this._notifview.getNotif will have been set in "connected" event
                        numMessages.text(that._notifview.getNotif());
                    }
                    if(!(data.socketID in that._ownSocketIDs)){ //some other tab has opened
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
                        socketID: that._socketID,
                        term: term
                    });
                }); 

                this._socketview.addListener('disconnected', function(data) {
                    console.log("disconnecting, ", that._nativeSocketID, data.socketID);
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

            function updateNumOnlineUsers(num, numOnlineObj) {
                numOnlineObj.text(num);
            }

            function generateID() {
                var time = new Date().getTime();
                return 'xxxyxyxyxyxyyyx4xxxyxxyyyxxyxyxx'.replace(/[xy]/g, function(match) {
                        var r = (time + Math.random()*16)%16 | 0;
                        time = Math.floor(time/16);
                        return (match == 'x' ? r : (r&0x3|0x8)).toString(32);
                    });
            }
            
            return OnlineView;
        })()
    };
});
