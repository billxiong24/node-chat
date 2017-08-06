require('dotenv').config({path: '../../.env'});
var BusManager = require('../../app/bus/bus_manager.js');
var Service = require('../service.js');

var ChatMicro = function(genClient) {
    Service.call(this, genClient);

    this._list_pub_channel = 'list_pub_channel';
    this._list_sub_channel = 'list_sub_channel';

    this._info_pub_channel = 'info_pub_channel';
    this._info_sub_channel = 'info_sub_channel';

    this._create_pub_channel = 'create_pub_channel';
    this._create_sub_channel = 'create_sub_channel';

    this._join_pub_channel = 'join_pub_channel';
    this._join_sub_channel = 'join_sub_channel';

    this._list_service = null;
    this._info_service = null;
    this._create_service = null;
    this._join_service = null;

    this._list_master = null;
    this._info_master = null;
    this._create_master = null;
    this._join_master= null;
};

ChatMicro.prototype = Object.create(Service.prototype);
ChatMicro.prototype.constructor =  ChatMicro;

ChatMicro.prototype.init = function() {
    var genClient = this._genClient;
    var list = new BusManager(genClient(), genClient(), this._list_pub_channel, this._list_sub_channel);
    var info = new BusManager(genClient(), genClient(), this._info_pub_channel, this._info_sub_channel);
    var create = new BusManager(genClient(), genClient(), this._create_pub_channel, this._create_sub_channel);
    var join = new BusManager(genClient(), genClient(), this._join_pub_channel, this._join_sub_channel);

    this._list_service = list.getService();
    this._info_service = info.getService();
    this._create_service = create.getService();
    this._join_service = join.getService();
};


module.exports = ChatMicro;
