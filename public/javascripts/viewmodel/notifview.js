define(['socketview'], function(socketview) {
    return {
        NotifView: (function() {
            
            function NotifView(socketview, notifications=0) {
                this._socketview = socketview;
                this._notifications = notifications;
            }

            NotifView.prototype.getRoomID = function() {
                return this._socketview.getRoomID();    
            };
            NotifView.prototype.incrementNotif = function() {
               this._notifications++; 
            };

            NotifView.prototype.resetNotif = function() {
                this._notifications = 0;
                
            };

            NotifView.prototype.setNotif = function(notif) {
                this._notifications = notif; 
            };

            NotifView.prototype.getNotif = function() {
                return this._notifications; 
            };

            
            NotifView.prototype.cacheNotification = function(userid) {
                    
                var notifications = this._notifications;
                var roomID = this._socketview.getRoomID();

                //this._socketview.send('cacheNotifications', {
                    //userid: userid,
                    //notif: notifications,
                    //roomID: roomID
                //});
            };
            NotifView.prototype.sendNotification = function(userid) {
                this.resetNotif();
                var notifications = this._notifications;
                var roomID = this._socketview.getRoomID();

                this._socketview.send('notify', {
                    userid: userid,
                    notif: notifications,
                    roomID: roomID
                });
                
            };

            function toJSON(that, userid) {
                return {
                    userid: userid,
                    notif: that._notifications,
                    roomID: that._socketview.roomID()
                };
            }

            return NotifView;
        })()
    };
});
