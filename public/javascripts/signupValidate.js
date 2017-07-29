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
            obj.email = $('input[name=email]').val();
            var confirmed = $('input[name=pass_confirm]').val();

            var para = $('#username_error');
            var pass = $('#password_error');
            console.log(obj.user_signup.length);
            if(obj.user_signup.length < 5) {
                para.text("Username should be at least 5 characters.");
                para.show();
                pass.hide();
                return;
            }

            if(obj.password_signup.length < 6) {
                pass.text("Password should be at least 6 characters.");
                para.hide();
                pass.show();
                return;
            }
            if(obj.password_signup !== confirmed) {
                pass.text("Passwords should match");
                pass.show();
                para.hide();
                return;
            }
            if(obj.user_signup === last_username) {
                console.log("same username");
                return;
            }
            last_username = obj.user_signup;  
            
            chatAjaxService.chatAjax('/signup', 'POST', JSON.stringify(obj), function(data) {
                if(!data.signup_error) {
                    window.location.replace('/signup_success');
                    return;
                }
                para.text(data.error);
                para.show();
                pass.hide();
            });
        });
    });
});
