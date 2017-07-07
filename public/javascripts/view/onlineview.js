define(['js/handlebars.min'], function(Handlebars) {
    return {
        OnlineView: (function() {
            function OnlineView(username, userid) {
                this._username = username;
                this._userid = userid;
            }

            OnlineView.prototype.renderOnlineUser = function(handlebars, partialObj) {
                //var html = partialObj.html();
                //var template = Handlebars.compile(html);
                return handlebars.templates[partialObj](toJSON(this));
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
