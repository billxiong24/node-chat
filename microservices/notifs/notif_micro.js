require('dotenv').config({path: '../../.env'});
var BusManager = require('../../app/bus/bus_manager.js');
var Service = require('../service.js');

var NotifMicro = function(genClient) {
    Service.call(this, genClient);

    this._load_pub_channel = 'notif_load_pub_channel';
    this._load_sub_channel = 'notif_load_sub_channel';

    this._flush_pub_channel = 'notif_flush_pub_channel';
    this._flush_sub_channel = 'notif_flush_sub_channel';

    this._load_service = null;
    this._flush_service = null;

    this._load_master = null;
    this._flush_master = null;
};

NotifMicro.prototype = Object.create(Service.prototype);
NotifMicro.prototype.constructor = NotifMicro;

NotifMicro.prototype.init = function() {
    var genClient = this._genClient;
    var load = new BusManager(genClient(), genClient(), this._load_pub_channel, this._load_sub_channel);
    var flush = new BusManager(genClient(), genClient(), this._flush_pub_channel, this._flush_sub_channel);

    this._load_service = load.getService();
    this._flush_service = flush.getService();
};

module.exports = NotifMicro;
