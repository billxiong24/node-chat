define(['socketview'], function(socketview) {
    return {
        ChatInfo: (function() {

                function ChatInfo(socketview, roomInfo, userid) {
                    this._client = socketview;
                    this._userid = userid;

                    var _this = this;
                    this._notifObj = initMap(roomInfo, function(val) {
                        _this._client.joinTargetRoom(val.id);
                    });
                }

                //private method...uses up a lot of memory?
                function initMap(roomInfo, func=function(room) {}) {
                    var notifObj = {};
                    $.each(roomInfo, function(ind, val) {
                        notifObj[val.id] = val;
                        func(val);
                    }); 

                    return notifObj;
                }

                ChatInfo.prototype.getNumNotifs = function(roomID) {
                    return this._notifObj[roomID];
                };

                ChatInfo.prototype.incrementGetNotif = function(roomID) {
                    return ++this._notifObj[roomID].num_notifications;
                };

                ChatInfo.prototype.resetGetNotif = function(roomID) {
                    this._notifObj[roomID].num_notifications = 0;
                    return 0;
                };

                ChatInfo.prototype.getUserID = function() {
                    return this._userid;    
                };

                ChatInfo.prototype.listenForNotifications = function(handler) {
                    this._client.addListener('notify', handler);
                };

                return ChatInfo;
            })()
    };
    
});

