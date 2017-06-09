var notifview = function($, io) {
    
    function NotifView(socketview, notifications=0) {
        this._socketview = socketview;
        this._notifications = notifications;
    }

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

    return NotifView;
};
