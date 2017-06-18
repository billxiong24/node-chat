module.exports = function (notifs) {

    notifs.forEach(function(element) {
        if(element.num_notifications === 0) {
            element.num_notifications = "";
        }
    });

    return notifs;
};
