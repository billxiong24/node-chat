//WHEN Handlebars IS LOADED BY REQUIRE.JS, Handlebars.templates, which loads
//precompiled templates, is undefined, so have to use this global variable for now.
//No idea why thsi happens
//make sure to use handlebars 4.0.10 for both global and local binary
const handlebars = Handlebars;

function parseID(url) {
    var str = url;
    if(str.charAt(str.length - 1) === '/') {
        str = str.substring(0, str.length - 1);
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



//XXX this is code is garbage and im sorry to anyone who has to read this 
var reached = false;

$(document).ready(function() {
    //TODO organize ajax calls
    var csrfTokenObj = {
        _csrf: $('input[name=_csrf]').val()
    };
    var roomID = parseID(window.location.pathname);
    var dependencies = ['chatAjaxService', 'onlineview', 'lineview', 'socketview', 'chatinfo', 
                    'typingview', 'notifview', 'chatview', 'chatviewmodel', 
                    'directChatView', 'onlineviewModel', 'votingview'];

    console.log("document is ready");
    initializeData(roomID, csrfTokenObj, dependencies);

    //HACK for some reason, require doesnt get called sometimes, so refresh the page if that's the case
    loopRequire();
});

function loopRequire() {
    var counter = 0;
    var timer = setInterval(function() {
        console.log("timing");
        if(++counter && !reached) {
            location.reload();
        }
        else if(reached) {
            clearInterval(timer);
        }
    }, 300);
}

function initializeData(roomID, csrfTokenObj, dependencies) {
    console.log("reached init data func");
    require(dependencies, function(chatAjaxService, 
                                    onlineview, 
                                    lineview, 
                                    socketview, 
                                    chatinfo, 
                                    typingview, 
                                    notifview, 
                                    chatview, 
                                    chatviewmodel, 
                                    directChatView,
                                    onlineviewModel, 
                                    votingview) {
        console.log("inside require function");
        reached = true;
        chatAjaxService.chatAjax(cutSlash(window.location.pathname)+'/renderInfo', 'POST', JSON.stringify(csrfTokenObj), function(data) {
            $('.chat-header').remove();
            $('.chat').prepend(handlebars.templates.chatinfo(data));
            //zombie cookie
            console.log("entered userid check");

            if(!sessionStorage.getItem('userid')) {
                console.log("userid not set");
                chatAjaxService.chatAjaxPromise('/home/fetch_home', 'POST', JSON.stringify(csrfTokenObj))
                .then(function(data) {
                    console.log("fetch_home post success");
                    Cookies.set('userid', data.cookie);
                    sessionStorage.setItem('userid', data.cookie);
                })
                .then(function(data) {
                    return ajaxRenderLines(chatAjaxService, csrfTokenObj);

                }).then(function(data) {
                    console.log("initLines post successful");
                    renderLinesCB(data);
                    setup(roomID, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview, chatviewmodel, directChatView, onlineviewModel, votingview);
                });
            }
            else {
                ajaxRenderLines(chatAjaxService, csrfTokenObj).then(function(data) {
                    renderLinesCB(data);
                    setup(roomID, socketview, chatinfo, typingview, notifview, chatview, lineview, onlineview, chatviewmodel, directChatView, onlineviewModel, votingview);
                });
            }
        });

        $('.remove-user').submit(function(evt) {
            evt.preventDefault();
            var chat_id = $(this).parent().attr('id');

            var postObj = {
                _csrf: csrfTokenObj._csrf,
                chatID: chat_id 
            };
            chatAjaxService.chatAjax(cutSlash(window.location.pathname)+'/remove_user', 'POST', JSON.stringify(postObj), 
                function(data) {
                    $('#' + chat_id).remove();
            });
        });

        

        $('.chat-history-group').scroll(function() {
            if($(this).scrollTop() !== 0) { return; }

            var firstMessage = $('.message-data:first');
            var curScroll = firstMessage.offset().top - $(document).scrollTop();

            var dataObj = {
                chatID: roomID,
                _csrf: csrfTokenObj._csrf
            };
            chatAjaxService.chatAjax('/chats/loadLines', 'POST', JSON.stringify(dataObj), 
                function(data) {
                    if(data.lines === null) {return;}

                    var chat = $('.chat-history-group');
                    var chatList = chat.find('ul');

                    //we want to prepend to beginning of list, since scrolling up
                    displayLines(chatList, handlebars, data.lines, function(line) {
                        chatList.prepend(line);
                    });

                    //TODO dont hardcode this, okay for now
                    console.log(firstMessage.height());
                    chat.scrollTop(firstMessage.offset().top - curScroll);
            });
        });
    });

    console.log("end of require function");
}

function ajaxRenderLines(chatAjaxService, csrfTokenObj) {
    return chatAjaxService.chatAjaxPromise(cutSlash(window.location.pathname)+'/initLines', 'POST', JSON.stringify(csrfTokenObj));
}

function renderLinesCB(data) {
    var chat = $('.chat-history-group');
    var chatList = chat.find('ul');
    displayLines(chatList, handlebars, data.lines, function(line) {
        chatList.append(line);
    });
    chat.scrollTop(chat[0].scrollHeight);
}

function setup(roomID, 
                socketview, 
                chatinfo, 
                typingview, 
                notifview, 
                chatview, 
                lineview, 
                onlineview, 
                chatviewmodel, 
                directChatView,
                onlineviewModel,
                votingview) {

    var userid = sessionStorage.getItem('userid');

    var cvm = new chatviewmodel.ChatViewModel(userid, roomID, handlebars);
    cvm.initChatNotifs(roomIDs, chatinfo, socketview);
    cvm.initTyping(typingview, socketview);
    cvm.initChat(socketview, chatview, notifview, onlineview, directChatView);
    cvm.initVoting(socketview, votingview);
}
