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
            if($(this).scrollTop() === 0) {
                //ajax call to the server
                //$('.chat-discussion').prepend("testing load");
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
