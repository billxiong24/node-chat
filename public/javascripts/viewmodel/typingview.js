define(['socketview'], function(socketview) {
    return {
        TypingView: (function() {

            function TypingView(userid, socketview, isTyping=false, timer=null) {
                this._userid = userid;
                this._socketview = socketview;
                this._socketview.joinRoom();
                this._isTyping = isTyping; 
                this._timer = timer;
            }

            //ratchet as fuck, need to pass "this" as parameter because
            //of scoping issues with timer function
            function timeoutTyping(that) {
                return function() {
                    that._isTyping = false;

                    var isTyping = that._isTyping;
                    var roomID = that._socketview.getRoomID();

                    that._socketview.send('typing', {
                        userid: that._userid, 
                        roomID: roomID,
                        isTyping: isTyping 
                    });
                };
            }

            TypingView.prototype.listenForTyping = function() {

                this._socketview.addListener('typing', function(data) {
                    var history = $('.chat-history-group');
                    var userEl = history.find('ul');
                    //var userEl = $('img[target='+data.userid+']');
                    if(data.isTyping) {
                        $('#typing').show();
                        history.scrollTop(history[0].scrollHeight);
                    }
                    else {
                        resetTyping(data.userid);
                    }
                });
            };

            function resetTyping(userid) {
                $('#typing').hide();
            }

            TypingView.prototype.keyUpEvent = function(element, timerClearOut) {
                var that = this;
                element.keyup(function(event) {
                    if(!that._isTyping && event.keyCode !== 13) {
                        that._isTyping = true;
                        that._socketview.send('typing', {
                            userid: that._userid,
                            roomID: that._socketview.getRoomID(),
                            isTyping: that._isTyping
                        });
                    }
                    clearTimeout(that._timer);
                    that._timer = setTimeout(timeoutTyping(that), timerClearOut);
                });
            };

            return TypingView;
        })()
    };
});

