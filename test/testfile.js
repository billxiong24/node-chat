require('dotenv').config();
process.env.NODE_ENV = "test";
var chai = require('chai');
var sinon = require('sinon');
var server; 
var mocha = require('mocha');

var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;
chai.use(chaiHttp);
var authenticator;

//TODO mock fakeredis so we can test messages properly
//TODO create testing database environment
beforeEach(function() {
    var auth = require('../app/authentication/user-pass.js');

    //stub authenticator middleware so we have access to all routes for testing
    var authStub = sinon.stub(auth, 'checkLoggedOut')
        .callsFake(function(req, res, next) {
            //no other choice, have to reset members everytime, which means
            //we are not going to be hitting the cache at all
            req.session.members = {};
            //mock some session user
            req.session.user = {
                id: 'b4b4b4e8201ea19c963b',
                username: 'jj45',
                first: "john",
                last: 'jones'
            };
            return next(); 
        });
    
    authenticator = auth;
    server = require('../app.js');
});

afterEach(function() {
    authenticator.checkLoggedOut.restore();

});

it('should get chat ids, names, notifs, and csrf token', function(done) {
    chai.request(server).get('/home').end(function(err, result) {
        result.should.have.status(200);
        var jsonTest = result.should.be.json;
        result.body.should.have.property('username');
        result.body.should.have.property('id');
        result.body.should.not.have.property('password');
        result.body.should.have.property('first');
        result.body.should.have.property('last');
        result.body.should.have.property('list');
        result.body.should.have.property('parseList');
        result.body.should.have.property('csrfToken');
        result.body.username.should.equals('jj45');
        result.body.id.should.equals('b4b4b4e8201ea19c963b');
        result.body.first.should.equals('john');
        result.body.last.should.equals('jones');

        var chatList = result.body.list;
        
        for(var i = 0; i < chatList.length; i++) {
            console.log(chatList[i]);
        }

        return done();
    });

});

it('should return an object containing user id', function() {

});
