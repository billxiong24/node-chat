//chat ajax function
//why the fuck is Handlebars.templates undefined
define(['js/handlebars.min'], function(Handlebars) {
    return {
        chatAjax: chatAjaxRequire(Handlebars)
    };
});

function chatAjaxRequire(Handlebars) {
    
    return function(url, type, data, callback) {
        $.ajax({
            url: url,
            type: type,
            data: data,
            contentType: 'application/json',
            success: function (data) {
                callback(data, Handlebars);
            },
            error: function(err) {
                console.log(err);
            }
        });
    };        
}
