require('dotenv').config({path: __dirname + '/../../.env'});

var BusManager = require('../../app/bus/bus_manager.js');
var UserManager = require('../../app/models/user_manager.js');
var UserCache = require('../../app/models/user_cache.js');
var UserMicro = require('./user_micro.js');

var UserService = function(user_manager, genClient) {
    UserMicro.call(this, genClient);
    this._user_manager = user_manager;
    this.init();
};

UserService.prototype = Object.create(UserMicro.prototype);
UserService.prototype.constructor = UserService;

UserService.prototype.listenService = function() {

    this.listen(this._leave_service);
    this.listen(this._signup_service);
    this.listen(this._authenticate_service);
    this.listen(this._updatePass_service);
    this.listen(this._updateProf_service);
    this.listen(this._authEmail_service);
};

UserService.prototype.authenticateService = function(username, password) {
    var that = this;
    this._user_manager.setUserObj(new UserCache(username));

    this._user_manager.authenticate(password, function(user) {
        that._authenticate_service.pubToChannel(JSON.stringify(user));
    });
};

UserService.prototype.signupService = function(info) {
    var infoObj = JSON.parse(info);

    var that = this;
    this._user_manager.setUserObj(new UserCache(infoObj.username).setPassword(infoObj.password).setJSON(infoObj));

    this._user_manager.signup(infoObj.password, function() {
        that._signup_service.pubToChannel(JSON.stringify({
            signup_error: true
        }));
    }, function(user) {
        that._signup_service.pubToChannel(JSON.stringify(user));
    });
};

UserService.prototype.leaveService = function(username, chatID) {
    var that = this;
    this._user_manager.setUserObj(new UserCache(username));

    this._user_manager.leave(chatID, function(rows) {
        that._leave_service.pubToChannel(JSON.stringify(rows));
    });
};

UserService.prototype.authenticateEmailService = function(username, userJSON, hash) {

    userJSON = JSON.parse(userJSON);

    var that = this;
    this._user_manager.setUserObj(new UserCache(username));

    this._user_manager.authenticateEmail(userJSON, hash, function(rows) {
        that._authEmail_service.pubToChannel(JSON.stringify(rows));
    });
};

UserService.prototype.updateUserProfileService = function(newObj, oldObj) {
    newObj = JSON.parse(newObj);
    oldObj = JSON.parse(oldObj);
    var that = this;
    this._user_manager.setUserObj(new UserCache(null).setJSON(oldObj));

    this._user_manager.updateUserProfile(newObj, function(rows, jsonObj) {
        var obj = {
            rows: rows,
            jsonObj: jsonObj
        };
        that._updateProf_service.pubToChannel(JSON.stringify(obj));
    });
};

UserService.prototype.updatePasswordService = function(infoObj, oldPass, newPass) {
    var that = this;
    this._user_manager.setUserObj(new UserCache(null).setJSON(infoObj));

    this._user_manager.updatePassword(oldPass, newPass, function(rows) {
        that._updatePass_service.pubToChannel(JSON.stringify(rows));
    });
};

module.exports = UserService;
