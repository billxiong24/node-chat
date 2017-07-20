requirejs.config({
    //use absolute path
    baseUrl: '/javascripts/',
    shim: {
        socketio: {
            exports: 'io'
        }
    },
    paths: {
        socketio:'socket.io-client/dist/socket.io',
        //TODO upgrade jquery version
        jquery: 'js/jquery-2.1.1',
        socketview: 'viewmodel/socketview',
        chatinfo: 'viewmodel/chatinfo',
        typingview: 'viewmodel/typingview',
        notifview: 'viewmodel/notifview',
        chatview: 'viewmodel/chatview',
        lineview: 'view/lineview',
        onlineview: 'view/onlineview',
        handlebars: 'js/handlebars.min',
        chatAjaxService: 'service/chatAjaxService',
        url_changer: 'url_changer',
        viewrender: 'view/viewrender',
        chatviewmodel: './chatViewModel',
        directChatView: './viewmodel/directChatView',
        onlineviewModel: 'viewmodel/onlineview',
        votingview: 'viewmodel/votingview'
    },
    waitSeconds: 930 
});
