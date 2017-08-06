require('dotenv').config({path: '../.env'});
var BusManager = require('../app/bus/bus_manager.js');

var ChatMicro = function(genClient) {
    this._genClient = genClient;
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

ChatMicro.prototype.init = function() {
    var genClient = this._genClient;
    var list = new BusManager(genClient(), genClient(), this._list_pub_channel, this._list_sub_channel);
    var info = new BusManager(genClient(), genClient(), this._info_pub_channel, this._info_sub_channel);
    var create = new BusManager(genClient(), genClient(), this._create_pub_channel, this._create_sub_channel);
    var join = new BusManager(genClient(), genClient(), this._join_pub_channel, this._join_sub_channel);

    this._list_service = list.getService();
    //this._list_master = list.getMaster();

    this._info_service = info.getService();
    //this._info_master = info.getService();
    
    this._create_service = create.getService();
    //this._create_master = create.getMaster();

    this._join_service = join.getService();
    //this._join_master= join.getMaster();
};

ChatMicro.prototype.getServices = function() {
    return {
        list_service: this._list_service,
        info_service: this._info_service,
        create_service: this._create_service,
        join_service: this._join_service
    };
};

//ChatMicro.prototype.getMasters = function() {
    //return {
        //list_master: this._list_master,
        //info_master: this._info_master,
        //create_master: this._create_master,
        //join_master: this._join_master
    //};
//};

ChatMicro.prototype.listen = function(service) {
    var that = this;
    var prototype = Object.getPrototypeOf(this);

    service.subToChannel(function(channel, message) {
        //in case we get message from wrong channel, shouldnt happen
        if(channel !== service.getSubChannel()) {
            console.log("wrong channel");
            return;
        }
        var json = JSON.parse(message);
        console.log(json.method);
        console.log(json.args);

        if(!prototype[json.method]) {
            console.log("method does not exist");
            return;
        }
        prototype[json.method].apply(that, json.args);
    });
};

ChatMicro.prototype.listenBack = function(service, callback) {
    var that = this;
    var prototype = Object.getPrototypeOf(this);

    service.subToChannel(function(channel, message) {
        //in case we get message from wrong channel, shouldnt happen
        if(channel !== service.getSubChannel()) {
            console.log("wrong channel");
            return;
        }

        var json = JSON.parse(message);
        callback(channel, json);

    });
};


module.exports = ChatMicro;
