var chatAjaxService = require('../service/chatAjaxService.js');
const handlebars = Handlebars;
//HACK refactor duplicate code
function parseID(url) {
    var str = url;
    if(str.charAt(str.length - 1) === '/') {
        str = str.substring(0, str.length - 1);
    }

    return str.split("/")[2];
}
function cutSlash(url) {
    var str = url;
    if(str.charAt(str.length - 1) === '/') {
        return str.substring(0, str.length - 1);
    }
    return str;
}
module.exports = (function() {
    var chatName = $('.change-name').text();
    var codeName = $(".chat-num-messages.code .chat-code").text();
    $(document).ready(function() {
        var csrfTokenObj = {
            _csrf: $('input[name=_csrf]').val()
        };

        $('#name-change').click(function(e) {
            e.preventDefault();
            var html = handlebars.templates.chat_settings({
                className: "name-form",
                inputClass: "name-input",
                name: chatName
            });
            $('.change-name').html(html);
        });

        $('#code-change').click(function(e) {
            e.preventDefault();
            console.log("whatoi");
            var html = handlebars.templates.chat_settings({
                className: "code-form",
                inputClass: "code-input",
                name: codeName 
            });
            $('.chat-code').html(html);
        });

        $('.chat-code').on('blur', '.code-input', function(evt) {
            evt.preventDefault();
            $('.chat-code').html('<span class="chat-code">'+codeName+'</span>');
        });

        $('.chat-code').on('submit', '.code-form', function(evt) {
            evt.preventDefault();
            var val = $('.code-input').val();
            return chatAjaxService.chatAjaxPromise(cutSlash(window.location.pathname)+'/updatedCode',
            'PUT', JSON.stringify({
                _csrf: csrfTokenObj._csrf,
                newCode: val
            }))
            .then(function(data) {
                codeName = val;
                $('.chat-code').html('<span class="chat-code">'+codeName+'</span>');
            });
        });

        $('.change-name').on('submit', '.name-form', function(evt) {
            evt.preventDefault();
            var val = $('.name-input').val();
            return chatAjaxService.chatAjaxPromise(cutSlash(window.location.pathname)+'/updatedName',
            'PUT', JSON.stringify({
                _csrf: csrfTokenObj._csrf,
                newName: val
            }))
            .then(function(data) {
                chatName = val;
                $('.change-name').html('<span class="change-name">'+chatName+'</span>');
            });
            //TODO PUT REQUEST
        });
        $('.change-name').on('blur', '.name-input', function(evt) {
            evt.preventDefault();
            $('.change-name').html('<span class="change-name">'+chatName+'</span>');
        });
    });

})();
