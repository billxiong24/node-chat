//chat ajax function
//why the fuck is Handlebars.templates undefined
define(['js/handlebars.min'], function(Handlebars) {
    return {
        chatAjax: chatAjaxRequire(Handlebars),
        chatAjaxPromise: chatAjaxPromise
    };
});

function chatAjaxPromise(url, type, data) {
    return $.ajax({
        url: url,
        type: type,
        data: data,
        contentType: 'application/json'
    });
}

function chatAjaxRequire(Handlebars) {
    
    return function(url, type, data, callback) {
        return $.ajax({
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
