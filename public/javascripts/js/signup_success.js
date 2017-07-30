$(document).ready(function() {
    require(['chatAjaxService'], function(chatAjaxService) {

        var validate = {
            _csrf: $('input[name=_csrf]').val()
        };

        $('#sendEmail').submit(function(event) {
            event.preventDefault();
            chatAjaxService.chatAjax('/sendEmail', 'POST', JSON.stringify(validate), function(data) {
                if(data.sent) {
                    //TODO update the view here
                }
            });
        });

    });
});
