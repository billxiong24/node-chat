module.exports = function (notifs) {
    var num_not_zero = 0;
    notifs.forEach(function(element) {
        if(element.num_notifications === 0) {
            element.num_notifications = "";
        }
        else {
            num_not_zero++;
        }
    });

    return {
        notifs: notifs,
        num_not_zero: num_not_zero
    };
};
