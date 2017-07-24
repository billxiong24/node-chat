/* jshint expr: true */
require('dotenv').config();
process.env.NODE_ENV = "test";

var chai = require('chai');
var sinon = require('sinon');
var server; 
var mocha = require('mocha');


var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;
var agent;

var Chat = require('../app/models/chat.js');
var connection = require('../app/database/config.js');
var UserCache = require('../app/models/user_cache.js');

chai.use(chaiHttp);
var authenticator;
var releaseSpy;
var addToCacheSpy;

beforeEach(function() {
    
    server = require('../app.js');
    agent = chai.request.agent(server);
    releaseSpy = sinon.spy(connection, 'release');
    addToCacheSpy = sinon.spy(UserCache.prototype, 'addToCache');
});

afterEach(function() {
    connection.release.restore();
    UserCache.prototype.addToCache.restore();
});

authenticateTest('/POST should authenticate user and add to cache', '/login', {
    username: 'jj45',
    password: 'jones'
}, function(result) {
    result.body.should.have.property('login_error');
    expect(result.body.login_error).to.equal(false);

    expect(addToCacheSpy.calledOnce).to.equal(true);
});

authenticateTest('/POST should reject auth because password is wrong, user should be in cache', '/login', {
    username: 'jj45',
    password: 'randompass'
}, function(result) {
    result.body.should.have.property('login_error');
    expect(result.body.login_error).to.equal(true);
    //user should be in cache from previous test
    expect(addToCacheSpy.calledOnce).to.equal(false);
});

authenticateTest('/POST should reject auth because username is wrong, user should not be in cache', '/login', {
    username: 'randomusername123',
    password: 'randompass'
}, function(result) {
    result.body.should.have.property('login_error');
    expect(result.body.login_error).to.equal(true);
    //dont add random  user to cache
    expect(addToCacheSpy.calledOnce).to.equal(false);
});

signupTest('/POST signup should work because meets all criteria, should add user to cache', '/signup', {
    user_signup: 'validUsername',
    password_signup: 'aValidPassword',
    firstname_signup: 'Firstname',
    lastname_signup: 'Lastname'
}, function(result) {
    expect(addToCacheSpy.calledOnce).to.equal(true);
});

signupTest('/POST signup should not work bc username is taken', '/signup', {
    user_signup: 'jj45  ',
    password_signup: 'doesntmatter',
    firstname_signup: 'firstdoesnt',
    lastname_signup: 'lastdoesnt'
}, function(result) {
    expect(addToCacheSpy.calledOnce).to.equal(false);
});

function signupTest(message, route, data, callback) {
    var obj = {};
    it(message, function(done) {
        agent.get(route).then(function(result) {
            result.body.should.have.property('csrfToken');
            obj._csrf = result.body.csrfToken;
            for(var key in data) {
                obj[key] = data[key];
            }

            return agent.post(route)
            .send(obj)
            .then(function(result) {
                callback(result);
                return done();
            });
        });
    });
}

function authenticateTest(message, route, data, callback) {
    var obj = {};
    it(message, function(done) {
        agent.get(route).then(function(result) {
            result.body.should.have.property('csrfToken');
            obj._csrf = result.body.csrfToken;
            for(var key in data) {
                obj[key] = data[key];
            }

            return agent.post(route)
            .send(obj)
            .then(function(result) {
                expect(releaseSpy.calledOnce).to.equal(true);
                result.should.be.json;
                callback(result);
                return done();
            });
        });
    });
    
}
