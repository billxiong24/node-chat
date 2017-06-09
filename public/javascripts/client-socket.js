$(document).ready(function() {
    //TODO fix this
    var userid = sessionStorage.getItem('userid');

    $('.chat-discussion').scrollTop(200000);

    var SocketView = socketview($, io);
    var TypingView = typingview($, io);
    var ChatView = chatview($, io);
    var NotifView = notifview($, io);

    var typingSocket = new SocketView(roomID, '/typing');
    var typeview = new TypingView(userid, typingSocket);

    var notifViewObj = new NotifView(new SocketView(roomID, '/notifications'));
    var chatViewObj = new ChatView(userid, new SocketView(roomID), notifViewObj);

    typeview.listenForTyping();
    typeview.keyUpEvent();

    chatViewObj.listenForOnlineUsers();
    chatViewObj.setReceiveListener();
    chatViewObj.setSubmitListener();
    
});
