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
        jquery: 'js/jquery-2.1.1',
        socketview: 'viewmodel/socketview',
        chatinfo: 'viewmodel/chatinfo',
        typingview: 'viewmodel/typingview',
        notifview: 'viewmodel/notifview',
        chatview: 'viewmodel/chatview'
    },
    waitSeconds: 3
});
