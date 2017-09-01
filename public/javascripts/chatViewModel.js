//TODO organize this using some frontend framework
var chatAjaxService = require('./service/chatAjaxService.js');

var ChatViewModel = (function() {
    var ChatViewModel = function(userid, roomID, handlebars) {
        this._csrfTokenObj = {
            _csrf: $('input[name=_csrf]').val()
        };
        this._roomID = roomID;
        this._handlebars = handlebars;
        this._userid = userid;

    };

    ChatViewModel.prototype.addFileHandler = function(SocketView, FileView) {
        var fileView = new FileView(this._userid, new SocketView(null, '/file'));
        fileView.deliverEventListener(function(delivery) {
        document.getElementById('fileupload').onchange = function (event) {
            var file = document.getElementById("fileupload").files[0];

            if (file) {
                delivery.send(file);
                var reader = new FileReader();
                reader.addEventListener('load', function() {
                    //TODO for previewing the file??
                }, false);
                reader.onerror = function (evt) {
                    console.log("error");
                };

                reader.readAsDataURL(file);
            }
        };

        }, function(fileID) {
            //TODO user confirmation
            console.log("finished", fileID);
        });
    };


    ChatViewModel.prototype.addStatsHandler = function(clickElement, chat_id, callback) {
        clickElement.on('click', function(evt) {
            evt.preventDefault();
            chatAjaxService.chatAjax('/users/stats', 'GET', {
                chat_id: chat_id

            }, function(data) {
                callback(data);
            });
        });
    };

    ChatViewModel.prototype.initChatNotifs = function(roomIDs, ChatInfo, SocketView) {
        var inf = new ChatInfo(new SocketView(null, '/notifications'), roomIDs, this._userid);
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

    ChatViewModel.prototype.initTyping = function(TypingView, SocketView) {
        var typeViewObj = new TypingView(this._userid, new SocketView(this._roomID, '/typing'));
        typeViewObj.listenForTyping();
        typeViewObj.keyUpEvent($('.submit-message'), 700);
    };

    ChatViewModel.prototype.initVoting = function(SocketView, VotingView) {
        var socketViewObj = new SocketView(this._roomID, '/vote');
        var votingViewObj = new VotingView(this._userid, socketViewObj);
        attachVotingListener(votingViewObj);
    };


    ChatViewModel.prototype.initChat = function(SocketView, ChatView, NotifView, OnlineView, DirectChatView, LetterAvatar) {
        neonChat.init(new SocketView(this._roomID));
        var socketviewObj = new SocketView(this._roomID);
        var notifViewObj = new NotifView(new SocketView(this._roomID, '/notifications'));
        var chatViewObj = new ChatView(this._userid, socketviewObj, notifViewObj);
        chatViewObj.initOnlineView($('.chat-group'), $('.online-now'), function(username, userid) {
            return new OnlineView(username, userid).renderTemplate(that._handlebars, 'online_user');
        });
        chatViewObj.init();

        var that = this;

        chatViewObj.setReceiveListener(function(lineViewObj) {
            var history = $('.chat-history-group');
            var list = history.find('ul');
            var message;
            if(lineViewObj.getDirection() === "right") {
                message = lineViewObj.renderTemplate(that._handlebars, 'message_template');
            }
            else {
                message = lineViewObj.renderTemplate(that._handlebars, 'message_response_template');
            }

            LetterAvatar.transform();

            lineViewObj.appendMessage(list, message);
            lineViewObj.scrollDown(history, history[0].scrollHeight);
        });

        chatViewObj.setSubmitListener($('#message-to-send'), $('.submit-message'));
        //direct messaging
        var directChatViewObj = new DirectChatView(this._userid, socketviewObj, null);
        var $chat = $("#chat"),
            $conversation_window = $chat.find(".chat-conversation"),
            $textarea = $conversation_window.find('.chat-textarea textarea');

        chatViewObj.setDirectListener($textarea);
        directChatViewObj.listenForDM($chat);

    };

    function attachVotingListener(votingViewObj) {
        var divParent = $('.chat-history-group ul');
        votingViewObj.setSubmitListener(divParent, '.voting');

        votingViewObj.setReceiveListener(function(data) {
            var numVotesObj = $('#'+data.line_id).children('.voting').children('.numVotes');
            //FIXME quick hack, since no viewmodel currently holds votes
            if(data.num_votes === 0) {
                numVotesObj.text("");
            }
            else {
                numVotesObj.text(data.num_votes);
            }
        });
    }
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

    return ChatViewModel;
})();
module.exports = ChatViewModel;
