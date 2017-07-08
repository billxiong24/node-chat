define(['js/handlebars.min', './viewrender'], function(Handlebars, viewrender) {
    return {
        LineView: (function() {
            function LineView(dir, time, active, username, message) {
                viewrender.ViewRender.call(this, username);
                this._dir = dir;
                this._time = time;
                this._active = active;
                //this._username = username;
                this._message = message;
            }

            LineView.prototype = Object.create(viewrender.ViewRender.prototype);
            LineView.prototype.constructor = LineView;

            //override
            LineView.prototype.toJSON = function() {
                return {
                    direction: this._dir,
                    viewStamp: this._time,
                    viewUsername: this.getUsername(),
                    active: this._active,
                    message: this._message
                };
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
        })()
   }; 
});
