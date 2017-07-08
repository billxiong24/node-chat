define(function() {
    return {
        Container: (function() {
            function Container() {}

            Container.prototype.setTemplate = function(template) {
                this._template = template;
            };

            Container.prototype.getTemplate= function() {
                return this._template;
            };

            return Container;
        })()
    };
});
