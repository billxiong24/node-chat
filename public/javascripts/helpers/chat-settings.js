var chatAjaxService = require('../service/chatAjaxService.js');
const handlebars = Handlebars;

                        //<li><a href="#" id="name-change">Change name</a>
                        //</li>
                        //<li><a href="#" id="code-change">Change code</a>
                        //</li>
                        //<li><a href="#" id="description-change">Add description</a>
                        //</li>
                        //<li class="divider"></li>
                        //<li><a href="#" id="block-user">Block user</a>

module.exports = (function() {
    var chatName = $('.change-name').text();
    var codeName = $(".chat-num-messages.code .chat-code").text();
    $(document).ready(function() {

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
            //TODO PUT REQUEST
        });

        $('.change-name').on('submit', '.name-form', function(evt) {
            evt.preventDefault();
            //TODO PUT REQUEST
        });
        $('.change-name').on('blur', '.name-input', function(evt) {
            evt.preventDefault();
            $('.change-name').html('<span class="change-name">'+chatName+'</span>');
        });
    });

})();
