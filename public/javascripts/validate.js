//TODO this needs refactoring but not urgent
$(document).ready(function() {
    require(['chatAjaxService'], function(chatAjaxService) {
        $('.user-login').submit(function(event) {
            event.preventDefault();
            //TODO sanitize input
            var validate = {
                username: $('input[name=username]').val(),
                password: $('input[name=password]').val(),
                _csrf: $('input[name=_csrf]').val()
            };


            chatAjaxService.chatAjax('/login', 'POST', JSON.stringify(validate), function(data, Handlebars) {
                if(!data.login_error) {
                    window.location.replace('/home');
                }
                else {
                   $('.login-error').text("Your username or password is incorrect.");
                }
            });
        });
    });
});
