define(['./container'], function() {
    return {
        ChatContainer: (function() {
            function ChatContainer() {
                container.Container.call(this);
            }

            ChatContainer.prototype = Object.create(container.Container.prototype);
            ChatContainer.prototype.constructor = ChatContainer;

            ChatContainer.prototype.setHeader = function(headerObj) {
                this._headerObj = headerObj;
            };

            ChatContainer.prototype.getHeader = function() {
                return this._headerObj;
            };

            ChatContainer.prototype.setHistory = function(historyObj) {
                this._chat = historyObj;
            };

            ChatContainer.prototype.getHistory = function() {
                return this._chat; 
            };

            ChatContainer.prototype.findList = function() {
                return this._chat ? this._chat.find('ul') : null;
            };

            ChatContainer.prototype.setTemplate = function(template) {
                this._template = template;
            };

            ChatContainer.prototype.getTemplate= function() {
                return this._template;
            };

            return ChatContainer;
        })()
    };
});
