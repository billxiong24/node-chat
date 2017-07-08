define(function() {
    return {
        ViewRender: (function() {
            var ViewRender = function(username) {
                this._username = username;
            };

            ViewRender.prototype.renderTemplate = function(handlebars, partialObj) {
                return handlebars.templates[partialObj](this.toJSON());
            };

            ViewRender.prototype.getUsername = function() {
                return this._username;
            };
            //this method should be overriden
            ViewRender.prototype.toJSON = function() {
                return {}; 
            };

            return ViewRender;
        })()
    };
});
