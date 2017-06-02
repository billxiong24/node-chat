$(document).ready(function() {
    var client = io('/notifications');
    client.on('notify', function(msg) {
        console.log("notified client" + msg);
    });
    
    $.ajax({
        type: 'POST',
        data: "", 
        contentType: 'application/json',
        url: '/home/fetch_home',
        success: function(data) {
            /* set cookie on loading home page */
            Cookies.set('userid', data.cookie);
            //TODO set up other important information, such as chat lists
        }
    });
})
