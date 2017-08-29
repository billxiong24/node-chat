function setHelpers(Handlebars) {
    Handlebars.registerHelper('if_eq', function(a, b, opts) {
        if (a == b) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper('firstLetter', function(str) {
        var theString = str.substring(0, 2);
        return new Handlebars.SafeString(theString);
    });
}

setHelpers(Handlebars);

module.exports = setHelpers;
