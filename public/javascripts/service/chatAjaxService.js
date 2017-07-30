//chat ajax function
//why the fuck is Handlebars.templates undefined
//define(function(Handlebars) {
    //return {
        //chatAjax: chatAjaxRequire(),
        //chatAjaxPromise: chatAjaxPromise
    //};
//});

function chatAjaxPromise(url, type, data) {
    return $.ajax({
        url: url,
        type: type,
        data: data,
        contentType: 'application/json'
    });
}

function chatAjaxRequire() {
    
    return function(url, type, data, callback) {
        return $.ajax({
            url: url,
            type: type,
            data: data,
            contentType: 'application/json',
            success: function (data) {
                callback(data);
            },
            error: function(err) {
                console.log(err);
            }
        });
    };        
}

module.exports = {
    chatAjaxPromise: chatAjaxPromise,
    chatAjax: chatAjaxRequire()
};
