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
var addToCacheSpy;
var userCacheInsertSpy;
var UserCache = require('../app/models/user_cache.js');
var PicManager = require('../app/chat_functions/pic_manager.js');

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
            req.user = {
                id: 'b4b4b4e8201ea19c963b',
                username: 'jj45',
                first: "john",
                last: 'jones',
                email: 'billx0477@gmail.com'
            };
            req.session.user = {
                id: 'b4b4b4e8201ea19c963b',
                username: 'jj45',
                first: "john",
                last: 'jones',
                email: 'billx0477@gmail.com'
            };
            return next(); 
        });

    var loadImageStub = sinon.stub(PicManager.prototype, 'loadImage')
    .callsFake(function(id) {
        return new Promise(function(resolve,reject) {
            resolve({});
        });
    });


    //monitor that every db request releases its connection 
    releaseSpy = sinon.spy(connection, 'release');
    //loadLists = sinon.spy(Chat.prototype, 'loadLists');
    addToCacheSpy = sinon.spy(UserCache.prototype, 'addToCache');
    userCacheInsertSpy = sinon.spy(UserCache.prototype, 'insert');
    
    authenticator = auth;
    server = require('../run/app.js');
    agent = chai.request.agent(server);
});

afterEach(function() {
    authenticator.checkLoggedOut.restore();
    connection.release.restore();
    UserCache.prototype.addToCache.restore();
    UserCache.prototype.insert.restore();
    PicManager.prototype.loadImage.restore();
    //Chat.prototype.loadLists.restore();

});

// HOME PAGE-----------------------------------------------------------------------
describe('home routing', function() {
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
});
//CHAT routing
//-----------------------------------------------------------------------
//TODO test 1 with memberof, and one without

describe('chat routes', function() {
    it('GET /:id should redirect somewhere, since user is not part of chat', function(done) {
        agent.get('/chats/0216c71e1eb20b8faaa8442a5b396535').then(function(result) {
            //console.log(loadLists.calledOnce);
            expect(result).to.redirect;
            return done();
        });
    });

    it('GET /:id/renderInfo should return correct header information about chat', function(done) {
        agent.get('/chats/019274b44a472600').then(function(result) {
            //console.log(loadLists.calledOnce);

            result.body.should.have.property('csrfToken');
            return agent.get('/chats/019274b44a472600/renderInfo')
            .then(function(result) {

                //expect(releaseSpy.calledOnce).to.equal(true);
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

    it('GET / initLines should give the inital lines user sees', function(done) {
        agent.get('/chats/019274b44a472600').then(function(result) {
            result.body.should.have.property('csrfToken');

            return agent.get('/chats/019274b44a472600/initLines')
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
                    //expect(releaseSpy.calledOnce).to.equal(true);
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
                .send({_csrf: result.body.csrfToken, joinChat: '7abade'})
                .then(function(result) {
                    //expect(releaseSpy.calledOnce).to.equal(true);
                    result.should.have.status(200);
                    result.body.should.have.property('joined');
                    result.body.joined.should.equals(true);
                    //var json = JSON.parse();
                    //expect(result).to.redirect;
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
                    //expect(releaseSpy.calledOnce).to.equal(true);
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

    it('GET /chats/loadLines should more lines if there are more lines', function(done) {
        agent.get('/home').then(function(result) {
            return agent.get('/chats/019274b44a472600/loadLines')
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

    it('GET /chats/loadLines should return null since there are no more lines', function(done) {
        agent.get('/home').then(function(result) {
            return agent.get('/chats/0c8beba0e895fe71eedc2794fa294fd6/loadLines')
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

});


//AUTHENTICATION
//-------------------------------------------------------------------------
describe('authentication routes', function() {
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
        lastname_signup: 'Lastname',
        email: 'willxiong@gmail.com'
    }, function(result) {
        expect(userCacheInsertSpy.calledOnce).to.equal(true);
        expect(result.res.client._httpMessage.res.text).to.not.equal(null);
        var json = JSON.parse(result.res.client._httpMessage.res.text);
        expect(json).to.have.property('signup_error');
        expect(json.signup_error).to.equal(false);
    });

    signupTest('/POST signup should not work bc username is taken', '/signup', {
        user_signup: 'jj45',
        password_signup: 'doesntmatter',
        firstname_signup: 'firstdoesnt',
        lastname_signup: 'lastdoesnt',
        email: 'someemail@gmail'
    }, function(result) {
        expect(addToCacheSpy.calledOnce).to.equal(false);
        expect(result.res.client._httpMessage.res.text).to.not.equal(null);
        var json = JSON.parse(result.res.client._httpMessage.res.text);
        expect(json).to.have.property('signup_error');
        expect(json.signup_error).to.equal(true);
    });

    it('/POST signup_auth should return some error since username too short', function(done) {
        agent.get('/signup').then(function(result) {
            result.body.should.have.property('csrfToken');

            return agent.post('/signup_auth')
            .send({
                _csrf: result.body.csrfToken,
                username: "d"
            })
            .then(function(result) {
                //wtf is this mess
                expect(result.res.client._httpMessage.res.text.length > 0).to.equal(true);
                return done();
            });
        });
    });

    it('/POST signup_auth should return some error since username exists', function(done) {
        agent.get('/signup').then(function(result) {
            result.body.should.have.property('csrfToken');

            return agent.post('/signup_auth')
            .send({
                _csrf: result.body.csrfToken,
                username: "marquis"
            })
            .then(function(result) {
                //wtf is this mess
                expect(result.res.client._httpMessage.res.text.length > 0).to.equal(true);
                return done();
            });
        });
    });

    signupTest('/POST signup should not work bc password doesnt qualify', '/signup', {
        user_signup: 'jj45',
        password_signup: 'a',
        firstname_signup: 'firstdoesnt',
        lastname_signup: 'lastdoesnt',
        email: 'anemail@gfaf'
    }, function(result) {
        expect(result.res.client._httpMessage.res.text).to.not.equal(null);
        var json = JSON.parse(result.res.client._httpMessage.res.text);
        expect(json).to.have.property('signup_error');
        expect(json.signup_error).to.equal(true);
    });

    it('POST /logout should redirect to login page', function(done) {
        agent.get('/login').then(function(result) {
            result.body.should.have.property('csrfToken');

            return agent.post('/logout')
            .send({
                _csrf: result.body.csrfToken,
            })
            .then(function(result) {
                //wtf is this mess
                expect(result).to.redirect;
                return done();
            });
        });
    });
});


describe('test user profile route', function() {
    it('should get user profile page correctly', function(done) {
        agent.get('/users/jj45').then(function(result) {
            result.should.have.status(200);
            result.body.should.have.property('csrfToken');
            result.body.should.have.property('email');
            result.body.should.have.property('parseList');
            result.body.should.have.property('list');

            return done();
        });
    });

    it('should redirect to users own profile, since accessing invalid profile', function(done) {
        agent.get('/users/bx69').then(function(result) {
            expect(result).to.redirect;
            return done();
        });
    });

    it('should correctly update users info', function(done) {
        agent.get('/users/jj45').then(function(result) {
            result.body.should.have.property('csrfToken');

            return agent.put('/users/jj45/updatedInfo')
            .send({
                first: 'ernie',
                last: 'johnson',
                email: 'willxiong@duke.edu',
                _csrf: result.body.csrfToken
            }).then(function(result) {
                return done();
            });
        });
    });

    it('should correctly update users password', function(done) {
        agent.get('/users/jj45').then(function(result) {
            result.body.should.have.property('csrfToken');

            return agent.put('/users/jj45/updatedPassword')
            .send({
                old_password: 'jones',
                new_password: 'newpass',
                _csrf: result.body.csrfToken
            }).then(function(result) {
                return done();
            });
        });
    });

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

function authenticateTest(message, route, data, callback, timeout=null) {
    var obj = {};
    it(message, function(done) {
        if(timeout) {
            this.timeout(timeout);
        }
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
