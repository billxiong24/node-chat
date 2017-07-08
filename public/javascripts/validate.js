//TODO this needs refactoring but not urgent
$(document).ready(function() {

    require(['chatAjaxService'], function(chatAjaxService) {


        $('input[name=user_signup]').blur(function(e) {
            var validate = {
                username: $('input[name=user_signup]').val(),
                _csrf: $('input[name=_csrf]').val()
            };

            chatAjaxService.chatAjax('/signup_auth', 'POST', JSON.stringify(validate), function(data, Handlebars) {
                var err = $('.error-message');
                if(!data) {
                    err.hide();
                }
                else {
                    var para = err.find('p');
                    para.text(data);
                    err.show();
                }
            });
        });

        $('input[name=password_signup]').blur(function(e) {
            var err = $('.error-message');
            if($(this).val().length < 6) {
                var para = err.find('p');
                para.text("Password should be at least 6 characters");
                err.show();
            }
            else {
                err.hide();
            }
        });

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
