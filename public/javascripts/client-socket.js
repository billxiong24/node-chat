$(document).ready(function() {

    //TODO organize ajax calls
    //client side rendering
    var csrfTokenObj = {
        _csrf: $('input[name=_csrf').val()
    };
    $.ajax({
        url: window.location.pathname +'/initLines',
        type: 'POST',
        data: JSON.stringify(csrfTokenObj),
        contentType: 'application/json',
        success: function (data) {
            var html = $('#message-template').html();
            var template = Handlebars.compile(html);
            var chatDiscussion = $('.chat-discussion');
            chatDiscussion.append(template(data.lines));
            chatDiscussion.scrollTop(2000000);
        }
    });

    $('.chat-discussion').scroll(function() {
        var firstMessage = $('.chat-line:first');
        if($(this).scrollTop() !== 0) { return; }
            //ajax call to the server
        $.ajax({
            url: '/chats/loadLines',
            type: 'POST',
            data: {
                chatID: window.location.pathname.split("/")[2],
                _csrf: csrfTokenObj._csrf
            },
            success: function (data) {
                if(data.lines === null) {return;}
                var chatDiscussion = $('.chat-discussion');

                var html = $('#message-template').html();
                var template = Handlebars.compile(html);
                chatDiscussion.prepend(template(data.lines));

                //TODO dont hardcode this, okay for now
                chatDiscussion.scrollTop(firstMessage.offset().top - 150);
            }
        });
    });

    var dependencies = ['jquery', 'onlineview', 'lineview', 'socketview', 'typingview', 'notifview', 'chatview'];
    require(dependencies, function($, onlineview, lineview, socketview, typingview, notifview, chatview) {
        if(!sessionStorage.getItem('userid')) {
            $.ajax({
                type: 'POST',
                data: JSON.stringify(csrfTokenObj),
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


        var typeViewObj = new typingview.TypingView(userid, new socketview.SocketView(roomID, '/typing'));
        var notifViewObj = new notifview.NotifView(new socketview.SocketView(roomID, '/notifications'));
        var chatViewObj = new chatview.ChatView(userid, new socketview.SocketView(roomID), notifViewObj);

        typeViewObj.listenForTyping('/images/typing.gif');
        typeViewObj.keyUpEvent($('.submit-message'), 700);


        //TODO USE handlebars for this
        chatViewObj.listenForOnlineUsers($('.list-online'), $('.online-now'), function(username, userid) {
            return new onlineview.OnlineView(username, userid).renderOnlineUser($('#onlineuser-template'));
        });
        
        chatViewObj.setReceiveListener(function(lineViewObj) {
            var message = lineViewObj.generateMessage($('#line-template'));
            lineViewObj.appendMessage($('.chat-discussion'), message);
            lineViewObj.scrollDown($('.chat-discussion'), 2000000);
        });

        chatViewObj.setSubmitListener($('.submit-message'), $('.message-input'));
    }
});
