$(document).ready(function() {
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
