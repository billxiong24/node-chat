/* jshint expr: true */
process.env.NODE_ENV = "test";
require('dotenv').config();

var chai = require('chai');
var sinon = require('sinon');
var server; 
var mocha = require('mocha');

var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;
var agent;

var LineCache = require('../app/models/line_cache.js');
var Line = require('../app/models/line.js');
var cache_functions = require('../app/cache/cache_functions.js');
var connection = require('../app/database/config.js');
var Notification = require('../app/models/notification.js');
var NotifManager = require('../app/chat_functions/notif_manager.js');
var Vote = require('../app/models/vote.js');
var VoteManager = require('../app/chat_functions/vote_manager.js');
var UserCache = require('../app/models/user_cache.js');
var UserManager = require('../app/models/user_manager.js');

var ProcessQueue = require('../app/workers/process_queue.js');

chai.use(chaiHttp);
var authenticator;

//TODO create testing database environment

describe('testing line model', function() {
    var createJobSpy;
    before(function() {
        createJobSpy = sinon.spy(ProcessQueue.prototype, "createJob");
    });
    after(function() {
        ProcessQueue.prototype.createJob.restore();
    });

    it('should insert line into redis cache', function(done) {
        var lineCache = new LineCache('0115411bc0ca11ec36b3730da5e50fbd', 'jj45', 'test message', 'id123');
        lineCache.insert();
        //TODO check cache to see exists
        cache_functions.popMessage('0115411bc0ca11ec36b3730da5e50fbd', 1, function(err, message) {
            //have to change this, cuz now returning array lol...wrip
            var messageJSON = message[0];
            expect(messageJSON).to.have.property('chat_id');
            expect(messageJSON).to.have.property('message');
            expect(messageJSON).to.have.property('line_id');
            expect(messageJSON).to.have.property('stamp');
            expect(messageJSON).to.have.property('username');

            expect(messageJSON.chat_id).to.equal('0115411bc0ca11ec36b3730da5e50fbd');
            expect(messageJSON.message).to.equal('test message');
            expect(messageJSON.line_id).to.equal('id123');
            expect(messageJSON.username).to.equal('jj45');
            return done();
        });
    });
    it('should not insert line into redis cache, since bad info', function(done) {
        var lineCache = new LineCache(null, null, 'test message', 'id123');
        lineCache.insert();
        //TODO check cache to see exists
        cache_functions.popMessage('0115411bc0ca11ec36b3730da5e50fbd', 1, function(err, message) {
            for(var i = 0; i < message.length; i++) {
                expect(message[i]).to.equal(null);
            }
            return done();
        });
    });

    it('should ensure reading lines from sql produces correct results', function(done) {
        var lineCache = new LineCache('0043e138f3a1daf9ccfbf718fc9acd48');
        var read = lineCache.read();
        var result = function(lineResults) {
            for(var i = 0; i < lineResults.length; i++) {
                expect(lineResults[i]).to.have.property('message');
                expect(lineResults[i]).to.have.property('line_id');
                expect(lineResults[i]).to.have.property('stamp');
                expect(lineResults[i]).to.have.property('username');
            }
            return done();
        };
        connection.executePoolTransaction([read, result], function(err) {
            throw err;
        });
    });

    it('should ensure that no lines are retrieve since doesnt exist', function(done) {
        var lineCache = new LineCache('adflkjanat');
        var read = lineCache.read();
        var result = function(lineResults) {
            expect(lineResults.length).to.equal(0);
            return done();
        };
        connection.executePoolTransaction([read, result], function(err) {
            throw err;
        });
    });
    
    it('should insert lines into redis cache', function(done) {
        //never change message queue limit
        var chatid = '0043e138f3a1daf9ccfbf718fc9acd48';
        var counter = 0;
        var cb = function(err, result) {
            ++counter;
        };
        for(var i = 0; i < 5; i++) {
            var lineCache = new LineCache(chatid, 'jj45', 'test message', 'id'+i);
            lineCache.insert(cb);
        }

        var interval = setInterval(function() {
            if(counter >= 5) {
                clearInterval(interval);
                return cache_functions.retrieveArray(chatid, 0, -1, function(err, arr) {
                    expect(arr.length).to.equal(5);
                    return done();
                });
            }
        }, 100);
    });

    it('should flush lines to db, only if they exist, and only if user is member', function(done) {

        var chatid = '0043e138f3a1daf9ccfbf718fc9acd48';
        var lineCache = new LineCache(chatid);
        lineCache.flush(5, function(result) {
            //should have inserted 5 new rows
            expect(result.affectedRows).to.equal(5);
            return done();
        });
    });

    it('read lines from database, should be the same', function(done) {
        var lineCache = new LineCache('0043e138f3a1daf9ccfbf718fc9acd48');
        var read = lineCache.read();
        var result = function(lineResults) {
            for(var i = 0; i < 5; i++) {
                expect(lineResults[i]).to.have.property('message');
                expect(lineResults[i]).to.have.property('username');
                expect(lineResults[i]).to.have.property('line_id');

                expect(lineResults[i].message).to.equal('test message');
                expect(lineResults[i].username).to.equal('jj45');
                //console.log(lineResults[i].line_id);
                expect(lineResults[i].line_id).to.equal('id'+(4-i));
            }
            return done();
        };
        connection.executePoolTransaction([read, result], function(err) {
            throw err;
        });
    });

    it('should trigger process queue to enqueue a process', function(done) {
        var chatid = '0043e138f3a1daf9ccfbf718fc9acd48';
        var counter = 0;
        var cb = function(err, result) {
            ++counter;
        };
        for(var i = 0; i < 60; i++) {
            var lineCache = new LineCache(chatid, 'jj45', 'queue message', 'idqueue'+i+Math.random());
            lineCache.insert(cb);
        }

        var interval = setInterval(function() {
            if(counter >= 60) {
                clearInterval(interval);
                expect(createJobSpy.called).to.equal(true);
            }
            return done();
        }, 600);

    });
});

describe('testing notifcation model', function() {

    it('should test reading notifications works', function(done) {
        var chatid = '0043e138f3a1daf9ccfbf718fc9acd48';
        var notif = new Notification(chatid, 'jj45', -1);
        
        var end = function(result) {
            expect(result[0].num_notifications).to.equal(32);
            return done();
        };

        connection.executePoolTransaction([notif.load(), end], function(err)  {
            throw err;
        });
          
    });

    it('should increment other notifs, reset your own', function(done) {
        var chatid = '0043e138f3a1daf9ccfbf718fc9acd48';
        var notif = new Notification(chatid, 'jj45', -1);

        var switched = false;
        notif.flush(function(result) {
            expect(result.affectedRows).to.equal(9);
            switched = true;
            return done();
        });
    });

    //FIXME for some reason this test does not work well with others
    //it('should test notif manager and load notifications', function(done) {

        //var chatid = '0043e138f3a1daf9ccfbf718fc9acd48';
        //var notif = new Notification(chatid, 'js12', -1);
        //var notif_manager = new NotifManager(notif);

        //var switched = false;
        //notif_manager.loadNotifications(function(result) {
            //expect(result).to.equal(8);
            //switched = true;
            //return done();
        //});
    //});
});

describe('testing voting model', function() {

    var chatid = '0043e138f3a1daf9ccfbf718fc9acd48';
    var lineid = '66911c1e2d91aa707bb613a63085d2052b759ca18a9aa1b9';
    var userid = 'ed48da0ecc35ed771bee';
    it('should correctly increment vote for user in chat', function(done) {
        var vote = new Vote(chatid);
        vote.setLineID(lineid).increment(userid, function(err, reply) {
            expect(reply).to.equal(1);
            return done();
        });
    });

    it('should decrement vote for user in chat', function(done) {
        var vote = new Vote(chatid);
        vote.setLineID(lineid).increment(userid, function(err, reply) {
            expect(reply).to.equal(0);
            return done();
        });

    });

    it('should read correct vote for user in chat', function(done) {
        var vote = new Vote(chatid);
        vote.setLineID(lineid).read(function(err, result) {
            //NOTE ioredis fucked this up, this is now a string
            //expect(result).to.equal(0);
            expect(result == 0).to.equal(true);
            return done();
        });
    });

    it('should read correct vote for bogus line id', function(done) {
        var vote = new Vote(chatid);
        vote.setLineID('adfkhaerakerkyer').read(function(err, result) {
            expect(result).to.equal(0);
            return done();
        });
    });

    it('should read correct vote for bogus line id and chat id', function(done) {
        var vote = new Vote('yujl;5tou');
        vote.setLineID('adfkhaerakerkyer').read(function(err, result) {
            expect(result).to.equal(0);
            return done();
        });
    });

    it('should read all votes correctly for a chat', function(done) {
        var vote = new Vote(chatid);
        var useridTemp = '4a0d226b7e15cd3';
        var lineidTemp = '0847098fc901b0ab27cfd8e72cae62e51735d20ff1b306d6';

        vote.setLineID(lineidTemp)
        .increment(useridTemp, function(err, reply) {
            vote.readAll().then(function(result) {

                expect(result).to.have.property(lineidTemp);
                expect(result).to.have.property(lineid);

                expect(result[lineidTemp]).to.equal('1');
                expect(result[lineid]).to.equal('0');

                return done();
            });
        });
    });
});

describe('test user model', function() {

    var userCache = new UserCache('nancywilson');
    var userManager = new UserManager(userCache); 

    it('should confirm password is correct, user should not be in cache', function(done) {
        userCache.confirmPassword('nancy', function(result) {
            expect(result).to.equal(true);
            //should have added user to cache if not
            expect(userCache.getInCache()).to.equal(true);
            return done();
        });
    });

    it('should confirm password is wrong, user should be in cache', function(done) {
        userCache.confirmPassword('asdflkjh', function(result) {
            expect(result).to.equal(false);
            expect(userCache.getInCache()).to.equal(true);
            return done();
        });
    });

    it('should successfully change password for user', function(done) {
        userManager.updatePassword('nancy', 'nancy123', function(result) {
            expect(result).to.have.property('affectedRows');
            expect(result.affectedRows).to.equal(1);
            return done();
        });
    });

    it('should successfully update settings for user', function(done) {
        var infoObj = {
            first: 'newnancy',
            last: 'newwilson',
            email: 'nancywilson@gmail.com',
            username: 'nancywilson',
            userid: 'doesnt matter'
        };

        userManager.updateUserProfile(infoObj, function(result, jsonObj) {
            expect(result).to.have.property('affectedRows');
            expect(result.affectedRows).to.equal(1);
            expect(jsonObj).to.have.property('first');
            expect(jsonObj).to.have.property('last');
            expect(jsonObj).to.have.property('email');
            expect(jsonObj).to.have.property('username');
            expect(jsonObj).to.have.property('id');

            expect(jsonObj.first).to.equal('newnancy');
            expect(jsonObj.last).to.equal('newwilson');
            expect(jsonObj.email).to.equal('nancywilson@gmail.com');
            expect(jsonObj.username).to.equal('nancywilson');
            return done();
        });
    });

    it('should fail update settings for user, since user does not exist', function(done) {
        var infoObj = {
            first: 'newnancy',
            last: 'newwilson',
            email: 'nancywilson@gmail.com',
            username: 'asdfadsfadfasdf',
            userid: 'doesnt matter'
        };
        userCache.setJSON(infoObj);

        userManager.updateUserProfile(infoObj, function(result, jsonObj) {
            expect(result).to.have.property('affectedRows');
            expect(result.affectedRows).to.equal(0);
            expect(jsonObj).to.equal(null);

            return done();
        });
    });


    var hash;
    it('should signup user properly', function(done) {
        var userCache = new UserCache('user1234', 'id12354', undefined, 'first', 'last', '123@gmail.com');
        var userManager = new UserManager(userCache); 
        var success = function(userObj) {
            expect(userObj).to.have.property('username');
            expect(userObj).to.have.property('first');
            expect(userObj).to.have.property('last');
            expect(userObj).to.have.property('hash');

            hash = userObj.hash;

            expect(userObj).to.have.property('id');
            expect(userObj).to.have.property('email');
            return done();
        };
        var failure = function() {

        };
        userManager.signup('pass123', failure, success);
    });

    it('should not confirm email of previous users, since hash wrong', function(done) {
        var userCache = new UserCache('user1234', 'id12354', undefined, 'first', 'last', '123@gmail.com');
        var userManager = new UserManager(userCache); 

        userManager.authenticateEmail(userCache.toJSON(), 'wronghash', function(result, jsonUser) {
            expect(result).to.equal(null);
            expect(jsonUser).to.equal(null);
            return done();
        });
    });

    it('should confirm email of previous users, since hash correct', function(done) {
        var userCache = new UserCache('user1234', 'id12354', undefined, 'first', 'last', '123@gmail.com');
        var userManager = new UserManager(userCache); 
        var json = userCache.toJSON(); 

        userManager.authenticateEmail(json, hash, function(result, jsonUser) {
            expect(result).to.have.property('affectedRows');
            expect(result.affectedRows).to.equal(1);
            expect(jsonUser).to.have.property('confirmed');
            expect(jsonUser.confirmed).to.equal(1);
            return done();
        });
    });
});
