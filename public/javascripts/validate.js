$(document).ready(function() {

    $('input[name=user_signup').on('keyup', function(e) {

        var validate = {};
        var param = $('input[name=user_signup').val();
        validate.username = param;
        $.ajax({
            type: 'POST',
            data: JSON.stringify(validate),
            contentType: 'application/json',
            url: 'http://localhost:3000/signup_auth',
            success: function(data) {
                $('.error-message').text(data);
            }
        });
    })
})
