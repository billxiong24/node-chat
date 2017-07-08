define(['./container'], function(container) {
    return {
        MessageContainer: (function() {
            function MessageContainer() {
                container.Container.call(this);
            }

            MessageContainer.prototype = Object.create(container.Container.prototype);
            MessageContainer.prototype.constructor = MessageContainer;

            MessageContainer.prototype.setResponseTemplate= function(template) {
                this._responseTemplate = template;
            };

            MessageContainer.prototype.getResponseTemplate = function() {
                return this._responseTemplate;
            };

            return MessageContainer;
        })()
    };
});
