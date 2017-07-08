//WHEN Handlebars IS LOADED BY REQUIRE.JS, Handlebars.templates, which loads
//precompiled templates, is undefined, so have to use this global variable for now.
//No idea why thsi happens
//make sure to use handlebars 4.0.10 for both global and local binary
const handlebars = Handlebars;

function parseID(url) {
    var str = url;
    if(str.charAt(str.length - 1) === '/') {
)       str = str.substring(0, str.length - 1);
    }

    return str.split("/")[2];

}

function cutSlash(url) {
    var str = url;
    if(str.charAt(str.length - 1) === '/') {
        return str.substring(0, str.length - 1);
    }
    return str;
}

function displayLines(chatList, handlebars, lines, display) {
    for(var i = 0; i < lines.length; i++) {
        var html, template;
        if(lines[i].direction === "right") {
            template = handlebars.templates.message_template(lines[i]);
        }
        else {
            template = handlebars.templates.message_response_template(lines[i]);
        }
        display(template);
    }
}

$(document).ready(function() {
    //TODO organize ajax calls
    var csrfTokenObj = {
        _csrf: $('input[name=_csrf]').val()
    };
    var roomID = parseID(window.location.pathname);
    var dependencies = ['jquery', 'chatAjaxService', 'onlineview', 'lineview', 'socketview', 'chatinfo', 'typingview', 'notifview', 'chatview', 'chatviewmodel'];

    initializeData(roomID, csrfTokenObj, dependencies);
});

function initializeData(roomID, csrfTokenObj, dependencies) {

    require(dependencies, function($, chatAjaxService, onlineview, lineview, socketview, chatinfo, typingview, notifview, chatview, chatviewmodel) {

        chatAjaxService.chatAjax(cutSlash(window.location.pathname)+'/renderInfo', 'POST', JSON.stringify(csrfTokenObj), function(data, Handlebars) {
            $('.chat-header').remove();
            $('.chat').prepend(handlebars.templates.chatinfo(data));
            //zombie cookie
            if(!sessionStorage.getItem('userid')) {
                chatAjaxService.chatAjax('/home/fetch_home', 'POST', JSON.stringify(csrfTokenObj), 
                    function(data, Handlebars) {
                        Cookies.set('userid', data.cookie);
                        sessionStorage.setItem('userid', data.cookie);
                        setup($, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview, chatviewmodel);
                });
            }
            else {
                setup(roomID, $, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview, chatviewmodel);
            }
        });

        chatAjaxService.chatAjax(cutSlash(window.location.pathname)+'/initLines', 'POST', JSON.stringify(csrfTokenObj), 
            function(data, Handlebars) {
                var chat = $('.chat-history-group');
                var chatList = chat.find('ul');
                //TODO precomile these templates
                displayLines(chatList, handlebars, data.lines, function(line) {
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
                    displayLines(chatList, handlebars, data.lines, function(line) {
                        chatList.prepend(line);
                    });

                    //TODO dont hardcode this, okay for now
                    //chatDiscussion.scrollTop(firstMessage.offset().top - 150);
            });
        });

    });
}

function setup(roomID, $, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview, chatviewmodel) {
    var userid = sessionStorage.getItem('userid');

    var cvm = new chatviewmodel.ChatViewModel(userid, roomID, handlebars);
    cvm.initChatNotifs(roomIDs, chatinfo, socketview);
    cvm.initTyping(typingview, socketview);
    cvm.initChat(socketview, chatview, notifview, onlineview);

    //var typeViewObj = new typingview.TypingView(userid, new socketview.SocketView(roomID, '/typing'));
    //typeViewObj.listenForTyping('/images/typing.gif');
    //typeViewObj.keyUpEvent($('.submit-message'), 700);
}
