var chatAjaxService = require('./service/chatAjaxService.js');
$(document).ready(function() {
    $('.validate').submit(function(event) {
        event.preventDefault();

        var obj = {
            first:$('input[name=first]').val(),
            last: $('input[name=last]').val(),
            email: $('input[name=email]').val(),
            _csrf: $('input[name=_csrf]').val()
        };
        chatAjaxService.chatAjax(window.location.pathname+'/updatedInfo', 'PUT', JSON.stringify(obj),function(data) {
            //TODO update result in UI
            console.log("updated");
        });
    });

    $('.password_form').submit(function(event) {
        event.preventDefault();
        var obj = {
            old_password:$('input[name=old_password]').val(),
            new_password:$('input[name=new_password]').val(),
            _csrf: $('input[name=_csrf]').val()
        };

        if(obj.new_password !== $('input[name=confirm_password]').val()) {
            console.log("doesnt match");
            return;
        }

        chatAjaxService.chatAjax(window.location.pathname+'/updatedPassword', 'PUT', JSON.stringify(obj), function(data) {
            console.log(data.changed);
            //TODO update result in UI
            if(data.changed) {
                return;
            }
        });
    });

});
