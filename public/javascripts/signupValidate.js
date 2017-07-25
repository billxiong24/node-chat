$(document).ready(function() {
    
    var last_username = null;

    function validate() {
        return false;
    }
    $(window).keydown(function(event){
        if((event.keyCode == 13) && (!validate())) {
              event.preventDefault();
              return false;
        }
    });

    require(['chatAjaxService'], function(chatAjaxService) {
        $('#form_register').submit(function(event) {
            event.preventDefault();
            var obj = {};
            obj._csrf = $('input[name=_csrf]').val();
            obj.user_signup =$('input[name=user_signup]').val();
            obj.password_signup = $('input[name=password_signup]').val();
            obj.firstname_signup = $('input[name=firstname_signup]').val();
            obj.lastname_signup = $('input[name=lastname_signup]').val();

            if(obj.user_signup.length < 5) {
                console.log("username failed");
                return;
            }

            if(obj.password_signup.length < 6) {
                console.log("password failed");
                return;
            }
            
            chatAjaxService.chatAjax('/signup', 'POST', JSON.stringify(obj), function(data) {
                if(!data.signup_error) {
                    window.location.replace('/home');
                }
            });
        });

        $('input[name=user_signup]').blur(function(e) {
            var validate = {
                username: $('input[name=user_signup]').val(),
                _csrf: $('input[name=_csrf]').val()
            };
            if(validate.username === last_username) {
                console.log("username was the same");
                return;
            }
            else {
                last_username = validate.username;
            }

            chatAjaxService.chatAjax('/signup_auth', 'POST', JSON.stringify(validate), function(data, Handlebars) {
                var para = $('#username_error');
                if(!data) {
                    para.hide();
                }
                else {
                    para.text(data);
                    para.show();
                }
            });
        });

        $('input[name=password_signup]').blur(function(e) {
            var para = $('#password_error');
            if($(this).val().length < 6) {
                para.text("Password should be at least 6 characters");
                para.show();
            }
            else {
                para.hide();
            }
        });
    });
});
