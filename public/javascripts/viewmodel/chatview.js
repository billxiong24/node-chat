var LineView = require('../view/lineview.js');
var OnlineView = require('./onlineview.js');

var ChatView = (function() {
    function ChatView(userid, socketview, notifview) {
        this._userid = userid;
        this._lastMessage = null;
        this._notifview = notifview;
        this._socketview = socketview;
        this._onlineview = new OnlineView(userid, socketview, notifview);
    }

    ChatView.prototype.init = function() {
        //TODO refactor joinRoom in chatview to a super class or something
        this._socketview.joinRoom();
        this._socketview.connect();
    };

    ChatView.prototype.getSocketView = function() {
        return this._socketview;
    };

    ChatView.prototype.getUsername = function() {
        return this._onlineview.getUsername();
    };

    ChatView.prototype.getConnectedSockets = function() {
        return this._onlineview.getConnectedSockets();
    };

    ChatView.prototype.getUserID = function() {
        return this._userid;
    };

    ChatView.prototype.initOnlineView = function(onlineList, numOnlineObj, renderList) {
        this._onlineview.listenForOnlineUsers(onlineList, numOnlineObj, renderList);
    };

    ChatView.prototype.setReceiveListener = function(displayLine) {
        var that = this;
        this._socketview.addListener('message', function(msg) {
            //holy shit this is bad- reset cookie if user deletes it lmao
            displayMessage.call(that, msg, that._userid, displayLine);
            //that._notifview.sendNotification(that._userid);
        });
    };

    ChatView.prototype.setDirectListener = function($textarea) {
        var that = this;
        $textarea.keydown(function(e) {
            if(e.keyCode == 13 && !e.shiftKey) {
                e.preventDefault();
                neonChat.submitMessage(that._socketview, that._onlineview.getConnectedSockets(), that._onlineview.getUsername(), that._userid);
                return false;
            }
            else if(e.keyCode == 27) {
                neonChat.close();
            }
        });
    };

    ChatView.prototype.setSubmitListener = function(textareaObj, submitForm) {
        var that = this;
        var textobj = textareaObj;
        submitForm.submit(function(event) {
            var message = textobj.val().trim();
            textobj.val('');
            if(message.length > 0) {
                that._socketview.send('message', message);
                that._notifview.sendNotification(that._userid);
            }

            return false;
        });
        textobj.keyup(function(event) {
            var message = textobj.val();
            if(event.keyCode == 13) {
                submitForm.submit();
            }
        });
    };

    //this message is cancerous
    function displayMessage(msg, userid, displayLine) {
        if(msg.message.length === 0) {
            return;
        }
        //var numMessages = $('.numMessages');
        var time = "";
        var dir;
        var active;

        if(msg.cookie === userid){
            dir = "right";
            active = "active";
        }
        else {
            dir = "left";
            active = "";
            this._notifview.incrementNotif();
        }

        var viewUsername = (!this._lastMessage || this._lastMessage !== msg.cookie) ? msg.username : "";
        var viewStamp = "";


        lineViewObj = new LineView({
            direction: dir,
            //TODO fix dis timestamp
            viewStamp: "",
            viewUsername:  viewUsername, 
            active: active,
            message: msg.message,
            line_id: msg.line_id
        });

        //numMessages.text(this._notifview.getNotif());
        //that._notifview.cacheNotification(userid);

        var message = displayLine(lineViewObj);
        this._lastMessage = msg.cookie;
    }

    return ChatView;
})();
module.exports = ChatView;
