$(document).ready(function() {

    require(['jquery', 'socketview', 'typingview', 'notifview', 'chatview'], function($, socketview, typingview, notifview, chatview) {
        if(!sessionStorage.getItem('userid')) {
            $.ajax({
                type: 'POST',
                data: "", 
                contentType: 'application/json',
                url: '/home/fetch_home',
                success: function(data) {
                    Cookies.set('userid', data.cookie);
                    sessionStorage.setItem('userid', data.cookie);
                    setup($, socketview, typingview, notifview, chatview);
                }
            });
        }

        else {
            setup($, socketview, typingview, notifview, chatview);
        }
    });
    //TODO fix this
    
    function setup($, socketview, typingview, notifview, chatview) {
        var userid = sessionStorage.getItem('userid');
        $('.chat-discussion').scrollTop(200000);

        var typeViewObj = new typingview.TypingView(userid, new socketview.SocketView(roomID, '/typing'));
        var notifViewObj = new notifview.NotifView(new socketview.SocketView(roomID, '/notifications'));
        var chatViewObj = new chatview.ChatView(userid, new socketview.SocketView(roomID), notifViewObj);

        typeViewObj.listenForTyping();
        typeViewObj.keyUpEvent();

        chatViewObj.listenForOnlineUsers();
        chatViewObj.setReceiveListener();
        chatViewObj.setSubmitListener();
    }
});
