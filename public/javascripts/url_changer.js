define(['chatAjaxService'], function(chatAjaxService) {

    return {
        addChangeURLEvent: changeURL(chatAjaxService) 
    };
});

function changeURL(chatAjaxService) {

    return function(selector, url, posturl, data, callback) {
        console.log(url, posturl);
        console.log(data);
        selector.on('click', function(event) {
            history.replaceState('state', 'title', url);
            event.preventDefault();
            chatAjaxService.chatAjax(posturl, 'POST', JSON.stringify(data),
            function(data, Handlebars) {
                callback(data, Handlebars);
            });
        });
    };
}

