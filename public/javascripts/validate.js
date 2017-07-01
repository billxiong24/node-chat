$(document).ready(function() {

    require(['chatAjaxService'], function(chatAjaxService) {

        console.log($('#signup-button'));

        $('input[name=user_signup]').on('keyup', function(e) {
            var validate = {
                username: $('input[name=user_signup]').val(),
                _csrf: $('input[name=_csrf]').val()
            };

            chatAjaxService.chatAjax('/signup_auth', 'POST', JSON.stringify(validate), function(data, Handlebars) {
                $('.error-message').text(data);
            });
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
        //$('.signup-form').submit(function(event) {
            //event.preventDefault();
            //var validate = {
                //first: $('input[name=firstname_signup]').val(),
                //last: $('input[name=lastname_signup]').val(),
                //username: $('input[name=user_signup]').val(),
                //password: $('input[name=password_signup]').val(),
                //_csrf: $('input[name=_csrf]').val()
            //};

            //if(validate.username.length < 4) {
                //return;
            //}
            //chatAjaxService.chatAjax('/signup', 'POST', JSON.stringify(validate), function(data, Handlebars) {
                //console.log(data.signup_error);
                //if(!data.signup_error) {
                    //window.location.replace('/home');
                //}
                //else {
                    ////TODO some sort of error handling, right now do nothing
                //}
            //});
        //});
    });
});
