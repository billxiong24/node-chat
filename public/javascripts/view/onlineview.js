define(['./viewrender'], function(viewrender) {
    return {
        OnlineView: (function() {
            function OnlineView(username, userid) {
                viewrender.ViewRender.call(this, username);
                this._userid = userid;
            }

            OnlineView.prototype = Object.create(viewrender.ViewRender.prototype);
            OnlineView.prototype.constructor = OnlineView;
            
            OnlineView.prototype.toJSON = function() {
                return {
                    username: this.getUsername(),
                    userid: this._userid
                };
            };

            return OnlineView;
        })()
    };
});
