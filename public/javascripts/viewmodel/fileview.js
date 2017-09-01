var Delivery = require('../js/delivery.js');

function FileView(userid, socketview) {
    this._socketview = socketview;
}

FileView.prototype.deliverEventListener = function(send, success) {
    var that = this;
    this._socketview.addListener('connect', function() {
        var deliv = new Delivery(that._socketview.getClient());
        deliv.on('delivery.connect', function(delivery) {
            console.log("sending");
            send(delivery);

        });

        deliv.on('send.success', function(fileID) {
            console.log("success");
            success(fileID);
        });

    });

};


module.exports = FileView;
