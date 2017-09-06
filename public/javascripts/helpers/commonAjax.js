var SocketView = require('../viewmodel/socketview.js');
var ChatViewModel = require('../chatViewModel.js');
var FileView = require('../viewmodel/fileview.js');
var chatAjaxService = require('../service/chatAjaxService.js');
var ChatViewModel = require('../chatViewModel');
var LetterAvatar = require('../helpers/canvas.js');

(function init(username, userid) {
    $(document).ready(function() {
        console.log(userid);
        var csrfTokenObj = {
            _csrf: $('input[name=_csrf]').val()
        };

        LetterAvatar.transformOther();


        //chatAjaxService.chatAjaxPromise('/images/user_profile', 'GET', {
            //userid: userid
        //}).then(function(data) {
            //console.log(data);
            //if(data.url) {
                //$('#prof-pic').attr('src', data.url + '?' + new Date().getTime());
                //console.log($('#prof-pic').attr('src'));
            //}
            //else {
                //console.log("no prof pic");
                //LetterAvatar.transform();
            //}
        //});

        $('#logout-link').click(function(event) {
            event.preventDefault();
            chatAjaxService.chatAjaxPromise('/logout', 'POST', JSON.stringify(csrfTokenObj))
            .then(function(data) {
                window.location.replace('/login');
            });
        });

        if(!sessionStorage.getItem('userid')) {
            chatAjaxService.chatAjaxPromise('/home/fetch_home', 'POST', JSON.stringify(csrfTokenObj))
            .then(function(data) {
                Cookies.set('userid', data.cookie);
                sessionStorage.setItem('userid', data.cookie);
            })
            .then(function(data) {
                cvm = new ChatViewModel(sessionStorage.getItem('userid'), null, null);
                cvm.addFileHandler(SocketView, FileView, 'fileupload', 'prof-pic');
            });
        }
        else {
            cvm = new ChatViewModel(sessionStorage.getItem('userid'), null, null);
            cvm.addFileHandler(SocketView, FileView, 'fileupload', 'prof-pic');
        }

        $('#change-picture').click(function(event) {
            event.preventDefault();
            $('#fileupload').click(function() {
            event.stopPropagation();
            });
            return false;
        });


        var oldFirst = $('input[name=first]').val();
        var oldLast = $('input[name=last]').val();
        var oldEmail = $('input[name=email]').val();
        $('.close-button').click(function(event) {
            $('input[name=first]').val(oldFirst);
            $('input[name=last]').val(oldLast);
            $('input[name=email]').val(oldEmail);
            $('input[name=old_password]').val("");
            $('input[name=new_password]').val("");
            $('input[name=confirm_password]').val("");
        });
        $('.validate').submit(function(event) {
            event.preventDefault();
            var obj = {
                first:$('input[name=first]').val(),
                last: $('input[name=last]').val(),
                email: $('input[name=email]').val(),
                _csrf: $('input[name=_csrf]').val()
            };
            chatAjaxService.chatAjax('/users/'+username+'/updatedInfo', 'PUT', JSON.stringify(obj),function(data) {
                //TODO update result in UI
                console.log("updated");
            });
        });

        $('.password-submit').submit(function(event) {
            //TODO update errors in UI, too lazy
            event.preventDefault();
            var obj = {
                old_password:$('input[name=old_password]').val(),
                new_password:$('input[name=new_password]').val(),
                _csrf: $('input[name=_csrf]').val()
            };
            
            if(obj.new_password.length < 6) {
                console.log("must be more than 6");
                return;
            }

            if(obj.new_password !== $('input[name=confirm_password]').val()) {
                console.log("doesnt match");
                return;
            }

            chatAjaxService.chatAjax('/users/'+username+'/updatedPassword', 'PUT', JSON.stringify(obj), function(data) {
                if(data.changed) {
                    //update ui
                    return;
                }
            });
        });

    });

})(username, userid);
