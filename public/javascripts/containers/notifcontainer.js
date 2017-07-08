define(['./container'], function(container) {
    return {
        NotifContainer: (function() {
            function NotifContainer() {
                container.Container.call(this);
            }

            NotifContainer.prototype = Object.create(container.Container.prototype);
            NotifContainer.prototype.constructor = NotifContainer;
            
            NotifContainer.prototype.setNotifHeader = function(notifObj) {
                this._notifHeader = notifObj;
            };

            NotifContainer.prototype.getNotifHeader = function() {
                return this._notifHeader;
            };

            return NotifContainer;
        })()
    };
});
