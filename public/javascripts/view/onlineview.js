define(function() {
    return {
        OnlineView: (function() {
            
            function OnlineView(username, userid) {
                this._username = username;
                this._userid = userid;
            }

            OnlineView.prototype.renderOnlineUser = function(partialObj) {
                var html = partialObj.html();
                var template = Handlebars.compile(html);
                return template(toJSON(this));
            };

            function toJSON(that) {
                return {
                    username: that._username,
                    userid: that._userid
                };
            }

            return OnlineView;
        })()
    };
});
