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
var releaseSpy; 
var loadLists;

var Chat = require('../app/models/chat.js');
var connection = require('../app/database/config.js');

chai.use(chaiHttp);
var authenticator;

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


    //monitor that every db request releases its connection 
    releaseSpy = sinon.spy(connection, 'release');
    //loadLists = sinon.spy(Chat.prototype, 'loadLists');
    
    authenticator = auth;
    server = require('../app.js');
    agent = chai.request.agent(server);
});

afterEach(function() {
    authenticator.checkLoggedOut.restore();
    connection.release.restore();
    //Chat.prototype.loadLists.restore();

});

// HOME PAGE-----------------------------------------------------------------------
it('GET /home should get chat ids, names, notifs, and csrf token', function(done) {
    chai.request(server).get('/home').end(function(err, result) {
        result.should.have.status(200);
        result.should.be.json;
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
            expect(chatList[i]).to.have.property('chat_name');
            expect(chatList[i]).to.have.property('code');
            expect(chatList[i]).to.have.property('num_notifications');
            expect(chatList[i]).to.have.property('username');
            expect(chatList[i]).to.have.property('id');

            //TODO check for accuracy, too lazy rn
        }

        return done();
    });

});

it('POST /home/fetch_home should return cookie with userid', function(done) {
    //NOTE we use agent here too persist cookies from 1 request to another
    agent.get('/home').then(function(result) {

        return agent.post('/home/fetch_home')
        .send({'_csrf': result.body.csrfToken})
        .then(function(result) {
            result.should.be.json;
            result.res.body.should.have.property('cookie');
            result.res.body.cookie.should.equals('b4b4b4e8201ea19c963b');
            return done();
        });
    });
});

//CHAT routing
//-----------------------------------------------------------------------
//TODO test 1 with memberof, and one without
it('POST /:id/renderInfo should return correct header information about chat', function(done) {
    agent.get('/chats/019274b44a472600').then(function(result) {
        //console.log(loadLists.calledOnce);

        result.body.should.have.property('csrfToken');
        return agent.post('/chats/019274b44a472600/renderInfo')
        .send({'_csrf': result.body.csrfToken})
        .then(function(result) {

            expect(releaseSpy.calledOnce).to.equal(true);
            result.should.have.status(200);
            result.body.should.have.property('id');
            result.body.should.have.property('name');
            result.body.should.have.property('code');
            result.body.should.have.property('notifs');
            result.body.should.have.property('csrfToken');

            result.body.id.should.equals('019274b44a472600');
            result.body.name.should.equals('many');
            result.body.code.should.equals('0840b3');

            return done();
        });
    });
});

it('POST / initLines should give the inital lines user sees', function(done) {
    agent.get('/chats/019274b44a472600').then(function(result) {
        result.body.should.have.property('csrfToken');

        return agent.post('/chats/019274b44a472600/initLines')
        .send({'_csrf': result.body.csrfToken})
        .then(function(result) {
            expect(releaseSpy.calledOnce).to.equal(true);
            result.should.have.status(200);
            result.should.be.json;
            result.body.should.have.property('lines');
            var lines = result.body.lines;

            for(var i = 0; i < lines.length; i++) {
                expect(lines[i]).to.have.property('line_id');
                expect(lines[i]).to.have.property('username');
                expect(lines[i]).to.have.property('message');
                expect(lines[i]).to.have.property('stamp');
            }
            return done();
        });
    });
});

it('POST /create_chat should insert chat into db and redirect to the chat', function(done) {
    agent.get('/home').then(function(result) {
        return agent.post('/chats/create_chat')
            .send({'_csrf': result.body.csrfToken, 'createChat': 'chatnametest'})
            .then(function(result) {
                expect(releaseSpy.calledOnce).to.equal(true);
                result.should.have.status(200);
                //result.should.be.json;
                //result.body.should.have.property('id');
                //result.body.should.have.property('chat_name');
                //result.body.should.have.property('code');
                return done();
        });
    });
});

it('POST /join_chat should add user to memberof table, since code is correct', function(done) {
    agent.get('/home').then(function(result) {
        return agent.post('/chats/join_chat')
            .send({'_csrf': result.body.csrfToken, 'joinChat': '7abade'})
            .then(function(result) {
                expect(releaseSpy.calledOnce).to.equal(true);
                result.should.have.status(200);
                expect(result).to.redirect;
                //result.should.be.json;
                //result.body.should.have.property('id');
                //result.body.should.have.property('chat_name');
                //result.body.should.have.property('code');
                return done();
        });
    });
});

it('POST /join_chat should send error, since code is wrong', function(done) {
    agent.get('/home').then(function(result) {
        return agent.post('/chats/join_chat')
            //sending wrong code
            .send({'_csrf': result.body.csrfToken, 'joinChat': 'aekrluybaafkgb'})
            .then(function(result) {
                //FIXME should redirect home, but don't know how to tell if home is reached
                expect(releaseSpy.calledOnce).to.equal(true);
                expect(Object.keys(result.body).length > 0).to.equal(true);
                return done();
        });
    });
});

it('POST /remove_user should not remove anyone since chatid doesnt exist', function(done) {
    agent.get('/home').then(function(result) {
        return agent.post('/chats/remove_user')
            //sending wrong code
            .send({'_csrf': result.body.csrfToken, 'chatID': 'aekrluybaafkgb'})
            .then(function(result) {
                result.should.have.status(200);
                result.body.should.have.property('deleted');
                //didnt delete anyone, since chat id doesnt exist
                result.body.deleted.should.equal(0);
                return done();
        });
    });
});

//BUG ?? removing from database doesnt actually affect database, but works??
it('POST /remove_user remove a user from chat, since user exists', function(done) {
    agent.get('/home').then(function(result) {
        return agent.post('/chats/remove_user')
            //sending wrong code
            .send({'_csrf': result.body.csrfToken, 'chatID': '1848e02805a2d142'})
            .then(function(result) {
                result.should.have.status(200);
                result.body.should.have.property('deleted');
                //user should have been removed from chat, so 1 row should be deleted
                result.body.deleted.should.equal(1);
                return done();
        });
    });
});

it('POST /chats/loadLines should more lines if there are more lines', function(done) {
    agent.get('/home').then(function(result) {
        return agent.post('/chats/loadLines')
        .send({'_csrf': result.body.csrfToken, chatID: '019274b44a472600'})
        .then(function(result) {
            result.body.should.have.property('lines');
            expect(result.body.lines).to.not.equal('null');
            result.should.have.status(200);
            result.should.be.json;
            return done();
        });
    });
});

it('POST /chats/loadLines should return null since there are no more lines', function(done) {
    agent.get('/home').then(function(result) {
        return agent.post('/chats/loadLines')
        .send({'_csrf': result.body.csrfToken, chatID: '0c8beba0e895fe71eedc2794fa294fd6'})
        .then(function(result) {
            result.body.should.have.property('lines');
            expect(result.body.lines).to.equal(null);
            result.should.have.status(200);
            result.should.be.json;
            return done();
        });
    });
});
