$(document).ready(function() {
    //TODO organize ajax calls
    //client side rendering
    var csrfTokenObj = {
        _csrf: $('input[name=_csrf]').val()
    };
    var roomID = window.location.pathname.split("/")[2];
    var dependencies = ['jquery', 'chatAjaxService', 'onlineview', 'lineview', 'socketview', 'typingview', 'notifview', 'chatview'];

    require(['url_changer'], function(url_changer) {
        //console.log(url_changer.addChangeURLEvent);
        var test = $('.test-url');
        var select = $('.test-input');
        url_changer.addChangeURLEvent(test, test.attr('href'), test.attr('href')+'/renderInfo', csrfTokenObj, function(data, Handlebars){
            console.log(data);
            roomID = data.id;
            initializeData(roomID, csrfTokenObj, dependencies);
        });
    });

    initializeData(roomID, csrfTokenObj, dependencies);
});


function initializeData(roomID, csrfTokenObj, dependencies) {
    require(dependencies, function($, chatAjaxService, onlineview, lineview, socketview, typingview, notifview, chatview) {
        chatAjaxService.chatAjax(window.location.pathname+'/renderInfo', 'POST', JSON.stringify(csrfTokenObj), function(data, Handlebars) {
            $('.ibox-title').remove();
            var html = $('#chatinfo-template').html();
            var template = Handlebars.compile(html);
            $('.ibox.chat-view').prepend(template(data));
            //zombie cookie
            if(!sessionStorage.getItem('userid')) {
                chatAjaxService.chatAjax('/home/fetch_home', 'POST', JSON.stringify(csrfTokenObj), 
                    function(data, Handlebars) {
                        Cookies.set('userid', data.cookie);
                        sessionStorage.setItem('userid', data.cookie);
                        setup($, socketview, typingview, notifview, chatview, lineview, onlineview);
                });
            }

            else {
                setup(roomID, $, socketview, typingview, notifview, chatview, lineview, onlineview);
            }
        });
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
                chatID: roomID,
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

    });
}

function setup(roomID, $, socketview, typingview, notifview, chatview, lineview, onlineview) {
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
