$(document).ready(function() {
    $('input[name=user_signup').on('keyup', function(e) {
        var validate = {};
        var param = $('input[name=user_signup').val();
        validate.username = param;
        $.ajax({
            type: 'POST',
            data: JSON.stringify(validate),
            contentType: 'application/json',
            url: '/signup_auth',
            success: function(data) {
                $('.error-message').text(data);
            }
        });
    });

    $('.user-login').submit(function(event) {
        event.preventDefault();
        //TODO sanitize input
        var validate = {
            username: $('input[name=username').val(),
            password: $('input[name=password').val(),
            _csrf: $('input[name=_csrf').val()
        };

        $.ajax({
            type: 'POST',
            data: JSON.stringify(validate),
            contentType: 'application/json',
            url: '/login',
            success: function(data) {
                console.log("sucess");
                if(!data.login_error) {
                    window.location.replace('/home');
                }
                else {
                   $('.login-error').text("Your username or password is incorrect.");
                }

            }
        });

    });
});
