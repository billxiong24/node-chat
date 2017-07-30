var ChatView = require('./chatview.js');
var DirectChatView = (function() {
    function DirectChatView(userid, socketview, notifview) {
        ChatView.call(this, userid, socketview, notifview);
    }

    DirectChatView.prototype = Object.create(ChatView.prototype);
    DirectChatView.prototype.constructor = DirectChatView;

    DirectChatView.prototype.listenForDM = function() {
        this.getSocketView().addListener('direct_message', function(data) {
            var msg = data.message;
            neonChat.pushMessage(data.senderID, msg.replace( /<.*?>/g, '' ), data.username, new Date(), true, true);
            if($('#'+data.senderID).hasClass('active')) {
                neonChat.renderMessages(data.senderID);
            }
            $('#'+data.senderID).children('.badge').remove();
            $('#'+data.senderID).append("<span class='badge badge-info badge-roundless'>New messages</span>");
        });
    };

    return DirectChatView;
})();
module.exports = DirectChatView;
