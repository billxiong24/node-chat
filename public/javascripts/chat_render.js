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
                console.log(data.lines);
                var chat = $('.chat-history-group');
                var chatList = chat.find('ul');
                //TODO precomile these templates
                for(var i = 0; i < data.lines.length; i++) {
                    var html, template;
                    if(data.lines[i].direction === "right") {
                        html = $('#messages-template').html();
                        template = Handlebars.compile(html);
                        chatList.append(template(data.lines[i]));
                    }
                    else {
                        html = $('#message-response-template').html();
                        template = Handlebars.compile(html);
                        chatList.append(template(data.lines[i]));
                    }
                }
                chat.scrollTop(chat[0].scrollHeight);
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

function setup(roomID, $, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview) {
    var userid = sessionStorage.getItem('userid');
    var inf = new chatinfo.ChatInfo(new socketview.SocketView(null, '/notifications'), roomIDs, userid);

    inf.listenForNotifications(function(data) {
        if(data.userid !== sessionStorage.getItem('userid')) {
            $('#'+data.roomID + ' span').text(inf.incrementGetNotif(data.roomID));
        }
        else {
            inf.resetGetNotif(data.roomID);
            $('#'+data.roomID + ' span').text(""); 
        }
    });


    var typeViewObj = new typingview.TypingView(userid, new socketview.SocketView(roomID, '/typing'));
    var notifViewObj = new notifview.NotifView(new socketview.SocketView(roomID, '/notifications'));
    var chatViewObj = new chatview.ChatView(userid, new socketview.SocketView(roomID), notifViewObj);

    typeViewObj.listenForTyping('/images/typing.gif');
    typeViewObj.keyUpEvent($('.submit-message'), 700);

    chatViewObj.listenForOnlineUsers($('.list-online'), $('.online-now'), function(username, userid) {
        //return new onlineview.OnlineView(username, userid).renderOnlineUser($('#onlineuser-template'));
    });
    
    chatViewObj.setReceiveListener(function(lineViewObj) {
        //var message = lineViewObj.generateMessage($('#line-template'));
        //lineViewObj.appendMessage($('.chat-discussion'), message);
        //lineViewObj.scrollDown($('.chat-discussion'), 2000000);
    });

    chatViewObj.setSubmitListener($('.submit-message'), $('.message-input'));
}
