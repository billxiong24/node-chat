//TODO need a password util to validate password
var SocketView = require('./viewmodel/socketview.js');
var ChatViewModel = require('./chatViewModel.js');
var FileView = require('./viewmodel/fileview.js');

var LetterAvatar = require('./helpers/canvas.js');
var chatAjaxService = require('./service/chatAjaxService.js');
var retrieve_prof_pic = require('./helpers/retrieve_prof_pic.js');

$(document).ready(function() {
    LetterAvatar.transform();
    var cvm = new ChatViewModel();
    if(!sessionStorage.getItem('userid')) {
        chatAjaxService.chatAjaxPromise('/home/fetch_home', 'POST', JSON.stringify(csrfTokenObj))
        .then(function(data) {
            Cookies.set('userid', data.cookie);
            sessionStorage.setItem('userid', data.cookie);
        })
        .then(function(data) {
            cvm = new ChatViewModel(sessionStorage.getItem('userid'), null, null);
            cvm.addFileHandler(SocketView, FileView, 'prof-pic');
        });
    }
    else {
        cvm = new ChatViewModel(sessionStorage.getItem('userid'), null, null);
        cvm.addFileHandler(SocketView, FileView, 'fileupload', 'img-pic');
    }

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

        chatAjaxService.chatAjax(window.location.pathname+'/updatedPassword', 'PUT', JSON.stringify(obj), function(data) {
            if(data.changed) {
                //update ui
                return;
            }
        });
    });
});
