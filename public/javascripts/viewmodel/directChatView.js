define(['socketview', 'notifview', 'chatview'], function(socketview, notifview, chatview) {
    return {
        DirectChatView: (function() {
            function DirectChatView(userid, socketview, notifview) {
                chatview.ChatView.call(this, userid, socketview, notifview);
            }

            DirectChatView.prototype = Object.create(chatview.ChatView.prototype);
            DirectChatView.prototype.constructor = DirectChatView;

            DirectChatView.prototype.listenForDM = function() {
                this.getSocketView().addListener('direct_message', function(data) {
                    var msg = data.message;
                    neonChat.pushMessage(data.senderID, msg.replace( /<.*?>/g, '' ), data.username, new Date(), true, true);
                    neonChat.renderMessages(data.senderID);
                    $('#'+data.senderID).children('.badge').remove();
                    $('#'+data.senderID).append("<span class='badge badge-info badge-roundless'>New messages</span>");
                                            //<span class="badge badge-secondary">{{num_notifications}}</span>
                });
            };

            return DirectChatView;
        })()
    };
});
