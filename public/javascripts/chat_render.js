$(document).ready(function() {
    //TODO organize ajax calls
    //client side rendering
    var csrfTokenObj = {
        _csrf: $('input[name=_csrf]').val()
    };
    var roomID = window.location.pathname.split("/")[2];
    var dependencies = ['jquery', 'chatAjaxService', 'onlineview', 'lineview', 'socketview', 'chatinfo', 'typingview', 'notifview', 'chatview'];

    //require(['url_changer'], function(url_changer) {
        ////console.log(url_changer.addChangeURLEvent);
        //var test = $('.test-url');
        //var select = $('.test-input');
        //url_changer.addChangeURLEvent(test, test.attr('href'), test.attr('href')+'/renderInfo', csrfTokenObj, function(data, Handlebars){
            //console.log(data);
            //roomID = data.id;
            //initializeData(roomID, csrfTokenObj, dependencies);
        //});
    //});

    initializeData(roomID, csrfTokenObj, dependencies);
});


function displayLines(chatList, Handlebars, lines, display) {
    for(var i = 0; i < lines.length; i++) {
        var html, template;
        if(lines[i].direction === "right") {
            html = $('#messages-template').html();
            template = Handlebars.compile(html);
        }
        else {
            html = $('#message-response-template').html();
            template = Handlebars.compile(html);
        }
        display(template(lines[i]));
    }
}
function initializeData(roomID, csrfTokenObj, dependencies) {
    require(dependencies, function($, chatAjaxService, onlineview, lineview, socketview, chatinfo, typingview, notifview, chatview) {
        chatAjaxService.chatAjax(window.location.pathname+'/renderInfo', 'POST', JSON.stringify(csrfTokenObj), function(data, Handlebars) {
            $('.chat-header').remove();
            var html = $('#chatheader-template').html();
            var template = Handlebars.compile(html);
            $('.chat').prepend(template(data));
            //zombie cookie
            if(!sessionStorage.getItem('userid')) {
                chatAjaxService.chatAjax('/home/fetch_home', 'POST', JSON.stringify(csrfTokenObj), 
                    function(data, Handlebars) {
                        Cookies.set('userid', data.cookie);
                        sessionStorage.setItem('userid', data.cookie);
                        setup($, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview);
                });
            }

            else {
                setup(roomID, $, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview);
            }
        });

        chatAjaxService.chatAjax(window.location.pathname+'/initLines', 'POST', JSON.stringify(csrfTokenObj), 
            function(data, Handlebars) {
                var chat = $('.chat-history-group');
                var chatList = chat.find('ul');
                //TODO precomile these templates
                displayLines(chatList, Handlebars, data.lines, function(line) {
                    chatList.append(line);
                });
                chat.scrollTop(chat[0].scrollHeight);
        });

        $('.chat-history-group').scroll(function() {
            if($(this).scrollTop() !== 0) { return; }

            var firstMessage = $('.message-data:first');
            var dataObj = {
                chatID: roomID,
                _csrf: csrfTokenObj._csrf
            };
            chatAjaxService.chatAjax('/chats/loadLines', 'POST', JSON.stringify(dataObj), 
                function(data, Handlebars) {
                    if(data.lines === null) {return;}

                    var chat = $('.chat-history-group');
                    var chatList = chat.find('ul');

                    //we want to prepend to beginning of list, since scrolling up
                    displayLines(chatList, Handlebars, data.lines, function(line) {
                        chatList.prepend(line);
                    });

                    //TODO dont hardcode this, okay for now
                    //chatDiscussion.scrollTop(firstMessage.offset().top - 150);
            });
        });

    });
}

function setup(roomID, $, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview) {
    var userid = sessionStorage.getItem('userid');
    var inf = new chatinfo.ChatInfo(new socketview.SocketView(null, '/notifications'), roomIDs, userid);

    inf.listenForNotifications(function(data) {
        var notif = $('#'+data.roomID + ' .badge');
        if(data.userid !== sessionStorage.getItem('userid')) {
            notif.text(inf.incrementGetNotif(data.roomID));
        }
        else {
            inf.resetGetNotif(data.roomID);
            notif.text(""); 
        }
    });


    var typeViewObj = new typingview.TypingView(userid, new socketview.SocketView(roomID, '/typing'));
    var notifViewObj = new notifview.NotifView(new socketview.SocketView(roomID, '/notifications'));
    var chatViewObj = new chatview.ChatView(userid, new socketview.SocketView(roomID), notifViewObj);

    typeViewObj.listenForTyping('/images/typing.gif');
    typeViewObj.keyUpEvent($('.submit-message'), 700);

    chatViewObj.listenForOnlineUsers($('.chat-group'), $('.online-now'), function(username, userid) {
        return new onlineview.OnlineView(username, userid).renderOnlineUser($('#onlineuser-template'));
    });
    
    chatViewObj.setReceiveListener(function(lineViewObj) {
        var history = $('.chat-history-group');
        var list = history.find('ul');
        var message;
        if(lineViewObj.getDirection() === "right") {
            message = lineViewObj.generateMessage($('#messages-template'));
        }
        else {
            message = lineViewObj.generateMessage($('#message-response-template'));
        }
        lineViewObj.appendMessage(list, message);
        lineViewObj.scrollDown(history, history[0].scrollHeight);
    });

    chatViewObj.setSubmitListener($('#message-to-send'), $('.submit-message'), $('.message-input'));
}
