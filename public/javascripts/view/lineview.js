define(function() {
    return {
        LineView: (function() {
            function LineView(jqChatObj, dir, time, active, username, message) {
                this._jqChatObj = jqChatObj;
                this._dir = dir;
                this._time = time;
                this._active = active;
                this._username = username;
                this._message = message;
            }

            LineView.prototype.renderOtherUserMessage = function() {
                return '<div class="'+this._dir+' chat-line">  <div class="chat-message '+this._active+'" style="text-align: left">' + this._message + '</div> </div>';
            };

            LineView.prototype.renderOwnMessage = function() {
                var dir = this._dir;
                var time = this._time;
                var username = this._username;
                var active = this._active;
                var message = this._message;

                return '<div class="'+dir+' chat-line"> <div class="author-name" id="mess"> <div class="date-chat">' + time + ' </div> <a class="author-name" href="#">' + username + '</a> </div> <div class="chat-message '+active+'" style="text-align: left">' + message + '</div> </div>';
                
            };

            LineView.prototype.appendMessage = function(message) {
                this._jqChatObj.append($(message));
            };

            LineView.prototype.scrollDown = function(scrollDistance) {
                this._jqChatObj.scrollTop(scrollDistance);
            };
    

            return LineView;
        })()
   }; 
});
