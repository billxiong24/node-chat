const handlebars = Handlebars;
var LetterAvatar = require('../helpers/canvas.js');
var SocketView = require('../viewmodel/socketview.js');
var ChatInfo = require('../viewmodel/chatinfo.js');
var ChatViewModel = require('../chatViewModel.js');
var chatAjaxService = require('../service/chatAjaxService');

$(document).ready(function() {

    var search_res = null;
    var csrfTokenObj = {
        _csrf: $('input[name=_csrf').val()
    };
    $.ajax({
        type: 'POST',
        data: JSON.stringify(csrfTokenObj), 
        contentType: 'application/json',
        url: '/home/fetch_home',
        success: function(data) {
            /* set cookie on loading home page */
            Cookies.set('userid', data.cookie);
            sessionStorage.setItem('userid', data.cookie);
            //TODO set up other important information, such as chat lists
            var userid = sessionStorage.getItem('userid');
            setup(userid);
        },
        error: function(error) {
            console.log(error);
        }
    });
    
    function setup(userid) {
        LetterAvatar.transform();
        $('.search_results_container').on('submit', '.chat_code_specific', function(evt) {
            evt.preventDefault();
            var thisObj = $(this);
            var index = $('.chat_code_specific').index(this);
            var chat_id = search_res[index]._id;
            var inputEl = thisObj.find('input[name=enter_code_specific]');
            var code = inputEl.val();
            //TODO ajax call to server
            chatAjaxService.chatAjax('/chats/verify_chat', 'POST', JSON.stringify({
                chat_id: chat_id,
                code: code,
                _csrf: csrfTokenObj._csrf

            }), function(data) {
                if(data.error) {
                    var html = handlebars.templates.code_error();
                    inputEl.val("");
                    thisObj.find('.code_error').remove();
                    inputEl.after(html);
                }
                else {
                    //TODO some success here
                    window.location.replace('/chats/'+chat_id);
                }
                console.log(data);
            });
        });

        $('.remove-user').submit(function(evt) {
            evt.preventDefault();
            var chat_id = $(this).parent().attr('id');

            var postObj = {
                _csrf: csrfTokenObj._csrf,
                chatID: chat_id 
            };
            chatAjaxService.chatAjax('/chats/remove_user', 'POST', JSON.stringify(postObj), 
            function(data) {
                $('#' + chat_id).remove();
            });
        });

        $('.search-bar').submit(function(evt) {
            evt.preventDefault();
            var searchTerm = $('input[name=searchChat]').val();

            chatAjaxService.chatAjax('/search', 'GET', {
                query: searchTerm

            }, function(data) {
                //replaces url without reloading page
                history.replaceState(null, null, '?query='+searchTerm);
                search_res = data.hits;
                var html = handlebars.templates.search_results({
                    num_results: data.total,
                    search_term: searchTerm,
                    result_list: data.hits
                });

                var results = $('.search_results_container');
                results.html(html);
            });
        });

        var cvm = new ChatViewModel(userid, null, null);
        cvm.initChatNotifs(roomIDs, ChatInfo, SocketView);
    }
});
