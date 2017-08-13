require('dotenv').config({path: '../../.env'});
var BusManager = require('../../app/bus/bus_manager.js');
var Service = require('../service.js');

var UserMicro = function(genClient) {
    Service.call(this, genClient);

    this._leave_pub_channel = 'leave_pub_channel';
    this._leave_sub_channel = 'leave_sub_channel';

    this._signup_pub_channel = 'signup_pub_channel';
    this._signup_sub_channel = 'signup_sub_channel';

    this._authenticate_pub_channel = 'authenticate_pub_channel';
    this._authenticate_sub_channel = 'authenticate_sub_channel';

    this._updatePass_pub_channel = 'updatePass_pub_channel';
    this._updatePass_sub_channel = 'updatePass_sub_channel';

    this._updateProf_pub_channel = 'updateProf_pub_channel';
    this._updateProf_sub_channel = 'updateProf_sub_channel';
    
    this._authEmail_pub_channel = 'authEmail_pub_channel';
    this._authEmail_sub_channel = 'authEmail_sub_channel';

    this._updatePass_pub_channel = 'updatePass_pub_channel';
    this._updatePass_sub_channel = 'updatePass_sub_channel';

    this._leave_service = null;
    this._signup_service = null;
    this._authenticate_service = null;
    this._updatePass_service = null;
    this._updateProf_service = null;
    this._authEmail_service = null;

    this._leave_master = null;
    this._signup_master = null;
    this._authenticate_master = null;
    this._updatePass_master= null;
    this._updateProf_master = null;
    this._authEmail_master = null;
};

UserMicro.prototype = Object.create(Service.prototype);
UserMicro.prototype.constructor = UserMicro;

UserMicro.prototype.init = function() {
    var genClient = this._genClient;

    var leave = new BusManager(genClient(), genClient(), this._leave_pub_channel, this._leave_sub_channel);
    var signup = new BusManager(genClient(), genClient(), this._signup_pub_channel, this._signup_sub_channel);
    var authenticate = new BusManager(genClient(), genClient(), this._authenticate_pub_channel, this._authenticate_sub_channel);
    var updatePass = new BusManager(genClient(), genClient(), this._updatePass_pub_channel, this._updatePass_sub_channel);
    var updateProf = new BusManager(genClient(), genClient(), this._updateProf_pub_channel, this._updateProf_sub_channel);
    var authEmail = new BusManager(genClient(), genClient(), this._authEmail_pub_channel, this._authEmail_sub_channel);

    this._leave_service = leave.getService();
    this._signup_service = signup.getService();
    this._authenticate_service = authenticate.getService();
    this._updatePass_service = updatePass.getService();
    this._updateProf_service = updateProf.getService();
    this._authEmail_service = authEmail.getService();
};

module.exports = UserMicro;
