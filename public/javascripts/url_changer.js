define(['chatAjaxService'], function(chatAjaxService) {

    return {
        addChangeURLEvent: changeURL(chatAjaxService) 
    };
});

function changeURL(chatAjaxService) {

    return function(selector, url, data, callback) {
        history.replaceState('state', 'title', url);
        chatAjaxService.chatAjax(url, 'POST', JSON.stringify(data),
        function(data, Handlebars) {
            callback(data, Handlebars);
        });
    };
}

