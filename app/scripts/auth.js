$(document).ready(function() {
      /* client side socket */
      var socket = io();
      $('.user-login').submit(function() {
            var username = $(".user-login input[name='username']").val();
            var password = $(".user-login input[name='password']").val();
            socket.emit('authenticate', {name: username, pass: password});
            return false;
      });

});
