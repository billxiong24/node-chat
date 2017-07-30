var ViewRender = require('./viewrender.js');
var OnlineView = (function() {
    function OnlineView(username, userid) {
        ViewRender.call(this, username);
        this._userid = userid;
    }

    OnlineView.prototype = Object.create(ViewRender.prototype);
    OnlineView.prototype.constructor = OnlineView;

    OnlineView.prototype.toJSON = function() {
        return {
            username: this.getUsername(),
            userid: this._userid
        };
    };

    return OnlineView;
})();
module.exports = OnlineView;
