var ViewRender = require('./viewrender.js');
var LineView = (function() {
    function LineView(jsonObj) {
        ViewRender.call(this, jsonObj.viewUsername);

        this._first = jsonObj.first;
        this._last = jsonObj.last;
        this._jsonObj = jsonObj;
        this._dir = jsonObj.direction;
        this._time = jsonObj.viewStamp;
        this._active = jsonObj.active;
        //this._username = username;
        this._message = jsonObj.message;
        this._line_id = jsonObj.line_id;
    }

    LineView.prototype = Object.create(ViewRender.prototype);
    LineView.prototype.constructor = LineView;

    //override
    LineView.prototype.toJSON = function() {
        return this._jsonObj;
    };

    LineView.prototype.getDirection = function() {
        return this._dir;
    };

    LineView.prototype.appendMessage = function(jqObj, message) {
        jqObj.append(message);
    };

    LineView.prototype.scrollDown = function(jqObj, scrollDistance) {
        jqObj.scrollTop(scrollDistance);
    };

    return LineView;
})();
module.exports = LineView;
