define(function() {
    return {
        OnlineView: (function() {
            
            function OnlineView(username, userid) {
                this._username = username;
                this._userid = userid;
            }

            OnlineView.prototype.renderOnlineUser = function() {
                return '<div class="chat-user-name"> <input class = "btn online-list" style="" type="submit" name = "chatname" value="'+this._username+'"><img src="" id="'+this._userid+'"><div class="label-warning notif pull-right" style="">  </div> </div>';
            };

            return OnlineView;
        })()
    };
});
