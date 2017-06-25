$(document).ready(function() {

    //TODO organize ajax calls
    //client side rendering
    var csrfTokenObj = {
        _csrf: $('input[name=_csrf').val()
    };

    var dependencies = ['jquery', 'chatAjaxService', 'onlineview', 'lineview', 'socketview', 'typingview', 'notifview', 'chatview'];

    require(dependencies, function($, chatAjaxService, onlineview, lineview, socketview, typingview, notifview, chatview) {

        chatAjaxService.chatAjax(window.location.pathname+'/initLines', 'POST', JSON.stringify(csrfTokenObj), 
            function(data, Handlebars) {
                var html = $('#message-template').html();
                var template = Handlebars.compile(html);
                var chatDiscussion = $('.chat-discussion');
                chatDiscussion.append(template(data.lines));
                chatDiscussion.scrollTop(2000000);
        });

        $('.chat-discussion').scroll(function() {
            if($(this).scrollTop() !== 0) { return; }

            var firstMessage = $('.chat-line:first');
            var dataObj = {
                chatID: window.location.pathname.split("/")[2],
                _csrf: csrfTokenObj._csrf
            };
            chatAjaxService.chatAjax('/chats/loadLines', 'POST', JSON.stringify(dataObj), 
                function(data, Handlebars) {
                    if(data.lines === null) {return;}

                    var chatDiscussion = $('.chat-discussion');
                    var html = $('#message-template').html();
                    var template = Handlebars.compile(html);
                    chatDiscussion.prepend(template(data.lines));

                    //TODO dont hardcode this, okay for now
                    chatDiscussion.scrollTop(firstMessage.offset().top - 150);
            });
        });

        if(!sessionStorage.getItem('userid')) {
            chatAjaxService.chatAjax('/home/fetch_home', 'POST', JSON.stringify(csrfTokenObj), 
                function(data, Handlebars) {
                    Cookies.set('userid', data.cookie);
                    sessionStorage.setItem('userid', data.cookie);
                    setup($, socketview, typingview, notifview, chatview, lineview, onlineview);
            });
        }

        else {
            setup($, socketview, typingview, notifview, chatview, lineview, onlineview);
        }
    });
    
    function setup($, socketview, typingview, notifview, chatview, lineview, onlineview) {
        var userid = sessionStorage.getItem('userid');


        var typeViewObj = new typingview.TypingView(userid, new socketview.SocketView(roomID, '/typing'));
        var notifViewObj = new notifview.NotifView(new socketview.SocketView(roomID, '/notifications'));
        var chatViewObj = new chatview.ChatView(userid, new socketview.SocketView(roomID), notifViewObj);

        typeViewObj.listenForTyping('/images/typing.gif');
        typeViewObj.keyUpEvent($('.submit-message'), 700);

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
