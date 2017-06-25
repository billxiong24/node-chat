define(['js/handlebars.min'], function(Handlebars) {
    return {
        LineView: (function() {
            function LineView(dir, time, active, username, message) {
                this._dir = dir;
                this._time = time;
                this._active = active;
                this._username = username;
                this._message = message;
            }

            LineView.prototype.generateMessage = function(partialObj) {
                var html = partialObj.html();
                var template = Handlebars.compile(html);
                return template(toJSON(this));
            };

            function toJSON(that) {
                return {
                    direction: that._dir,
                    viewStamp: that._time,
                    viewUsername: that._username,
                    active: that._active,
                    message: that._message
                };
            }


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
