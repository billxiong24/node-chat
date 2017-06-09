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
                    var userEl = $('#'+data.userid);
                    if(data.isTyping) {
                        userEl.attr('src', '/images/typing.gif');
                    }
                    else {
                        resetTyping(data.userid);
                    }
                });
            };

            function resetTyping(userid) {
                $('#'+userid).attr('src', "");
            }


            TypingView.prototype.keyUpEvent = function() {

                var that = this;
                $('.submit-message').keyup(function() {
                    if(!that._isTyping) {
                        that._isTyping = true;
                        that._socketview.send('typing', {
                            userid: that._userid,
                            roomID: that._socketview.getRoomID(),
                            isTyping: that._isTyping
                        });
                    }
                    clearTimeout(that._timer);
                    that._timer = setTimeout(timeoutTyping(that), 700);
                });
            };
            return TypingView;
        })()
    };
});

