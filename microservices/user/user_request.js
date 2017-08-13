require('dotenv').config({path: '/../../.env'});
var UserMicro = require('./user_micro.js');

var UserRequest = function(genClient) {
    UserMicro.call(this, genClient);
};

UserRequest.prototype = Object.create(UserMicro.prototype);
UserRequest.prototype.constructor = UserRequest;

UserRequest.prototype.authenticateRequest = function(username, password, callback) {
    this.genListen('_authenticate_master', this._authenticate_pub_channel, this._authenticate_sub_channel, callback);
    this.publishChannel(this._authenticate_master, 'authenticateService', [username, password]);
};

UserRequest.prototype.signupRequest = function(infoObj, callback) {
    this.genListen('_signup_master', this._signup_pub_channel, this._signup_sub_channel, callback);
    this.publishChannel(this._signup_master, 'signupService', [JSON.stringify(infoObj)]);
};

UserRequest.prototype.leaveRequest = function(username, chatID, callback) {
    this.genListen('_leave_master', this._leave_pub_channel, this._leave_sub_channel, callback);
    this.publishChannel(this._leave_master, 'leaveService', [username, chatID]);
};

UserRequest.prototype.updatePasswordRequest = function(infoObj, oldPass, newPass, callback) {
    this.genListen('_updatePass_master', this._updatePass_pub_channel, this._updatePass_sub_channel, callback);
    this.publishChannel(this._updatePass_master, 'updatePasswordService', [infoObj, oldPass, newPass]);
};

UserRequest.prototype.updateUserProfileRequest = function(newObj, oldObj, callback) {
    this.genListen('_updateProf_master', this._updateProf_pub_channel, this._updateProf_sub_channel, callback);

    var nObj = JSON.stringify(newObj);
    var oObj = JSON.stringify(oldObj);
    this.publishChannel(this._updatePass_master, 'updateUserProfileService', [nObj, oObj]);
};

UserRequest.prototype.authenticateEmailRequest = function(username, userJSON, hash, callback) {
    this.genListen('_authEmail_master', this._authEmail_pub_channel, this._authEmail_sub_channel, callback);
    var json = JSON.stringify(userJSON);
    this.publishChannel(this._updatePass_master, 'authenticateEmailService', [username, json, hash]);
};

module.exports = UserRequest;
