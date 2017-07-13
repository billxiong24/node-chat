//TODO organize this using some frontend framework
define(function() {
    return {
        ChatViewModel: (function() {
            var ChatViewModel = function(userid, roomID, handlebars) {
                this._csrfTokenObj = {
                    _csrf: $('input[name=_csrf]').val()
                };
                this._roomID = roomID;
                this._handlebars = handlebars;
                this._userid = userid;

            };

            ChatViewModel.prototype.initChatNotifs = function(roomIDs, chatinfo, socketview) {
                var inf = new chatinfo.ChatInfo(new socketview.SocketView(null, '/notifications'), roomIDs, this._userid);

                inf.listenForNotifications(function(data) {
                    var notif = $('#'+data.roomID + ' .badge');
                    //previously seessionStorage
                    if(data.userid !== sessionStorage.getItem('userid')) {
                        notif.text(inf.incrementGetNotif(data.roomID));
                    }
                    else {
                        inf.resetGetNotif(data.roomID);
                        notif.text(""); 
                    }
                });
            };

            ChatViewModel.prototype.initTyping = function(typingview, socketview) {
                var typeViewObj = new typingview.TypingView(this._userid, new socketview.SocketView(this._roomID, '/typing'));
                typeViewObj.listenForTyping();
                typeViewObj.keyUpEvent($('.submit-message'), 700);
            };

            ChatViewModel.prototype.initChat = function(socketview, chatview, notifview, onlineview, directChatView) {
                neonChat.init(new socketview.SocketView(this._roomID));
                var socketviewObj = new socketview.SocketView(this._roomID);

                var notifViewObj = new notifview.NotifView(new socketview.SocketView(this._roomID, '/notifications'));
                var chatViewObj = new chatview.ChatView(this._userid, socketviewObj, notifViewObj);
                chatViewObj.init();

                var that = this;
                chatViewObj.listenForOnlineUsers($('.chat-group'), $('.online-now'), function(username, userid) {
                    return new onlineview.OnlineView(username, userid).renderTemplate(that._handlebars, 'online_user');
                });
                chatViewObj.setReceiveListener(function(lineViewObj) {
                    var history = $('.chat-history-group');
                    var list = history.find('ul');
                    var message;
                    if(lineViewObj.getDirection() === "right") {
                        message = lineViewObj.renderTemplate(handlebars, 'message_template');
                    }
                    else {
                        message = lineViewObj.renderTemplate(handlebars, 'message_response_template');
                    }

                    lineViewObj.appendMessage(list, message);
                    lineViewObj.scrollDown(history, history[0].scrollHeight);
                });

                chatViewObj.setSubmitListener($('#message-to-send'), $('.submit-message'));
                //direct messaging
                var directChatViewObj = new directChatView.DirectChatView(this._userid, socketviewObj, null);

                var $chat = $("#chat"),
                $conversation_window = $chat.find(".chat-conversation"),
                $textarea = $conversation_window.find('.chat-textarea textarea');

                chatViewObj.setDirectListener($textarea);
                directChatViewObj.listenForDM($chat);

            };

            function displayLines(chatList, lines, display) {
                for(var i = 0; i < lines.length; i++) {
                    var html, template;
                    if(lines[i].direction === "right") {
                        template = this._handlebars.templates.message_template(lines[i]);
                    }
                    else {
                        template = this._handlebars.templates.message_response_template(lines[i]);
                    }
                    display(template);
                }
            }

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

            return ChatViewModel;
            
        })()
    };
});

