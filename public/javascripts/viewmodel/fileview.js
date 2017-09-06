var Delivery = require('../js/delivery.js');

function FileView(userid, socketview) {
    this._socketview = socketview;
    this._socketview.joinTargetRoom('profile_' + userid);
}

FileView.prototype.deliverEventListener = function(send, success) {
    var that = this;
    this._socketview.addListener('connect', function() {
        var deliv = new Delivery(that._socketview.getClient());
        deliv.on('delivery.connect', function(delivery) {
            send(delivery);
        });

        deliv.on('send.success', function(fileID) {
            console.log("success sending file");
        });
    });
};

FileView.prototype.storedImageListener = function(callback) {
    this._socketview.addListener('storedImage', function(data) {
        console.log("howdy");
        callback(data);
    });
};

module.exports = FileView;
