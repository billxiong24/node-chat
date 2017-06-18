$(document).ready(function() {

    var dependencies = ['jquery', 'onlineview', 'lineview', 'socketview', 'typingview', 'notifview', 'chatview'];
    require(dependencies, function($, onlineview, lineview, socketview, typingview, notifview, chatview) {
        if(!sessionStorage.getItem('userid')) {
            $.ajax({
                type: 'POST',
                data: "", 
                contentType: 'application/json',
                url: '/home/fetch_home',
                success: function(data) {
                    Cookies.set('userid', data.cookie);
                    sessionStorage.setItem('userid', data.cookie);
                    setup($, socketview, typingview, notifview, chatview, lineview, onlineview);
                }
            });
        }

        else {
            setup($, socketview, typingview, notifview, chatview, lineview, onlineview);
        }
    });
    //TODO fix this
    
    function setup($, socketview, typingview, notifview, chatview, lineview, onlineview) {
        var userid = sessionStorage.getItem('userid');

        $('.chat-discussion').scrollTop(2000000);

        $('.chat-discussion').scroll(function() {
                var firstMessage = $('.chat-line:first');
                        console.log(firstMessage.offset().top + "first message");
                        console.log($('.chat-discussion').scrollTop() + "chat scroll");
            if($(this).scrollTop() === 0) {
                //ajax call to the server
                $.ajax({
                    url: '/chats/loadLines',
                    type: 'POST',
                    data: {chatID: window.location.pathname.split("/")[2]},
                    success: function (data) {
                        if(data.lines === null) {return;}
                        var lines = data.lines;
                        var prevUser = null;
                        var chatDiscussion = $('.chat-discussion');
                        var messageContent = "";
                        for(var i = 0; i < lines.length; i++) {
                            var dir = data.username === lines[i].username ? "right" : "left";
                            var active = data.username === lines[i].username ? "active" : "";
                            var lineViewObj = new lineview.LineView(chatDiscussion, dir, lines[i].viewStamp, active, lines[i].username, lines[i].message);

                            if(!prevUser || lines[i].username !== prevUser) {
                                messageContent += lineViewObj.renderOwnMessage();
                                
                            }
                            else {
                                messageContent += lineViewObj.renderOtherUserMessage();
                            }
                               
                            prevUser = lines[i].username;

                        }
                        chatDiscussion.prepend($(messageContent));
                        chatDiscussion.scrollTop(firstMessage.offset().top - 150);
                        console.log(firstMessage.offset().top + "first message");
                        console.log($('.chat-discussion').scrollTop() + "chat scroll");
                    }
                });
            }
        });

        var typeViewObj = new typingview.TypingView(userid, new socketview.SocketView(roomID, '/typing'));
        var notifViewObj = new notifview.NotifView(new socketview.SocketView(roomID, '/notifications'));
        var chatViewObj = new chatview.ChatView(userid, new socketview.SocketView(roomID), notifViewObj);

        typeViewObj.listenForTyping('/images/typing.gif');
        typeViewObj.keyUpEvent($('.submit-message'), 700);


        //TODO USE handlebars for this
        chatViewObj.listenForOnlineUsers($('.list-online'), $('.online-now'), function(username, userid) {
            return new onlineview.OnlineView(username, userid).renderOnlineUser();
        });
        
        chatViewObj.setReceiveListener(function(dir, ownUser, username, time, active, message) {
            var lineViewObj = new lineview.LineView($('.chat-discussion'), dir, time, active, username, message);
            if(!ownUser) {
                lineViewObj.appendMessage(lineViewObj.renderOtherUserMessage());
            }
            else {
                lineViewObj.appendMessage(lineViewObj.renderOwnMessage());
            }
            lineViewObj.scrollDown(2000000);
        });

        chatViewObj.setSubmitListener($('.submit-message'), $('.message-input'));
    }
});
