require('dotenv').config({path: __dirname + '../.env'});
process.env.NODE_ENV = "test";

var chai = require('chai');
var sinon = require('sinon');
var mocha = require('mocha');

var should = chai.should();
var expect = chai.expect;


var NotifService = require('../microservices/notifs/notif_service.js');
var ChatService = require('../microservices/chat/chat_service.js');
var NotifRequest = require('../microservices/notifs/notif_request.js');
var ChatRequest = require('../microservices/chat/chat_requester.js');

var Bus = require('../app/bus/bus.js');

var listen = require('../microservices/process.js');
var CleanClient = require('../app/cache/clean_client.js');
var redis = require('fakeredis');

var pubSpy;
beforeEach(function() {
    pubSpy = sinon.spy(Bus.prototype, 'pubToChannel');

});

afterEach(function() {
    Bus.prototype.pubToChannel.restore();

});

before(function() {
    listen.start();
});

after(function() {

});


describe('testing chat microservice', function() {
    var loadListSpy, loadChatSpy, joinSpy, createSpy;
    before(function() {
        loadListSpy = sinon.spy(ChatService.prototype, 'loadChatListService');
        loadChatSpy = sinon.spy(ChatService.prototype, 'loadChatService');
        joinSpy = sinon.spy(ChatService.prototype, 'joinChatService');
        createSpy = sinon.spy(ChatService.prototype, 'createChatService');
    });

    after(function() {
        ChatService.prototype.loadChatListService.restore();
        ChatService.prototype.loadChatService.restore();
        ChatService.prototype.joinChatService.restore();
        ChatService.prototype.createChatService.restore();
        //listen.stop();
    });

    it('should load chat list service', function(done) {
        var clean_client = new CleanClient();
        var chatRequest = new ChatRequest(clean_client.genClient());
        var userObj = {
            first: 'bill',
            last: 'xiong',
            username: 'marquis',
            id: '46f5a4a0d226b7e15cd3'
        };

        chatRequest.loadChatListRequest('12345', userObj, function(channel, json) {
            expect(loadListSpy.calledOnce).to.equal(true);
            //one for publisher, one for listener
            //NOTE this will fail if we have multiple processes listening
            expect(pubSpy.calledTwice).to.equal(true);

            expect(json).to.have.property('userJSON');
            expect(json).to.have.property('members');
            expect(json).to.have.property('inChat');
            expect(json.inChat).to.equal(false);
            expect(json.userJSON).to.have.property('id');
            expect(json.userJSON).to.have.property('csrfToken');
            expect(json.userJSON).to.have.property('parseList');
            expect(json.userJSON).to.have.property('list');
            //do we really need to test specifics
            expect(json.userJSON.list.length).to.equal(3);
            expect(json.userJSON.csrfToken).to.equal('12345');
            expect(json.userJSON.id).to.equal('46f5a4a0d226b7e15cd3');
            clean_client.cleanup();

            return done();
        });
    });

    it('should load chat list with bogus input', function(done) {
        var clean_client = new CleanClient();
        var chatRequest = new ChatRequest(clean_client.genClient());
        //doesnt matter what id is, username matters
        var userObj = {
            first: 'bill',
            last: 'xiong',
            username: 'adflkjh',
            id: 'b4b4b4e8201ea19c963b'
        };

        chatRequest.loadChatListRequest('12345', userObj, function(channel, json) {
            expect(loadListSpy.calledTwice).to.equal(true);
            expect(pubSpy.callCount).to.equal(2);

            expect(json).to.have.property('userJSON');
            expect(json).to.have.property('members');
            expect(json).to.have.property('inChat');
            expect(json.inChat).to.equal(false);
            expect(json.userJSON).to.have.property('id');
            expect(json.userJSON).to.have.property('csrfToken');
            expect(json.userJSON).to.have.property('parseList');
            expect(json.userJSON).to.have.property('list');

            //do we really need to test specifics
            expect(json.userJSON.list.length).to.equal(0);
            expect(json.userJSON.csrfToken).to.equal('12345');
            expect(Object.keys(json.members).length).to.equal(0);
            expect(json.userJSON.id).to.equal('b4b4b4e8201ea19c963b');
            
            clean_client.cleanup();

            return done();
        });
    });

    it('should load null chat information, cuz chatid doesnt exist', function(done) {
        var clean_client = new CleanClient();
        var chatRequest = new ChatRequest(clean_client.genClient());
        chatRequest.loadChatRequest('marquis', 'fakeid', function(channel, json) {
            expect(loadChatSpy.calledOnce).to.equal(true);
            expect(pubSpy.callCount).to.equal(2);
            expect(json).to.equal(null);
            clean_client.cleanup();
            return done();
        });
    });

    it('should load proper chat information', function(done) {
        var clean_client = new CleanClient();
        var chatRequest = new ChatRequest(clean_client.genClient());
        chatRequest.loadChatRequest('marquis', '0872be6f7f48a3f4', function(channel, json) {
            expect(loadChatSpy.calledTwice).to.equal(true);
            expect(pubSpy.callCount).to.equal(2);

            expect(json).to.have.property('id');
            expect(json).to.have.property('name');
            expect(json).to.have.property('code');
            expect(json).to.have.property('username');

            expect(json.id).to.equal('0872be6f7f48a3f4');
            expect(json.name).to.equal('a sedcond chat');
            expect(json.code).to.equal('436bc0');
            expect(json.notifs).to.equal(53);

            clean_client.cleanup();
            return done();
        });
    });

    it('should properly join a chat, given correct code', function(done) {
        var clean_client = new CleanClient();
        var chatRequest = new ChatRequest(clean_client.genClient());
        chatRequest.joinChatRequest('marquis', 'pqbj', function(channel, json) {
            expect(joinSpy.calledOnce).to.equal(true);
            expect(pubSpy.callCount).to.equal(2);

            expect(json).to.have.property('id');
            expect(json).to.have.property('name');
            expect(json).to.have.property('code');
            expect(json).to.have.property('username');
            expect(json).to.have.property('notifs');

            expect(json.name).to.equal('excepturi');
            expect(json.notifs).to.equal(0);
            expect(json.username).to.equal('marquis');

            clean_client.cleanup();
            return done();
        });
    });

    it('should properly create chat given correct input', function(done) {
        var clean_client = new CleanClient();
        var chatRequest = new ChatRequest(clean_client.genClient());
        chatRequest.createChatRequest('marquis', 'newchatplease', function(channel, json) {
            expect(createSpy.calledOnce).to.equal(true);
            expect(pubSpy.callCount).to.equal(2);

            expect(json).to.have.property('id');
            expect(json).to.have.property('name');
            expect(json).to.have.property('code');
            expect(json).to.have.property('username');
            expect(json).to.have.property('notifs');

            expect(json.name).to.equal('newchatplease');
            expect(json.notifs).to.equal(0);
            expect(json.username).to.equal('marquis');
            return done();
        });
    });

    //this throws an error, how to catch??
    //it('should not create chat, since username does not exist', function(done) {
        //clients = [];
        //var chatRequest = new ChatRequest(clean_client.genClient());
        //chatRequest.createChatRequest('emptyusername', 'newchatplease', function(channel, json) {
            //expect(createSpy.calledOnce).to.equal(true);
            //expect(pubSpy.callCount).to.equal(14);
            //cosole.log(json);

            ////expect(json).to.have.property('id');
            ////expect(json).to.have.property('name');
            ////expect(json).to.have.property('code');
            ////expect(json).to.have.property('username');
            ////expect(json).to.have.property('notifs');

            ////expect(json.name).to.equal('newchatplease');
            ////expect(json.notifs).to.equal(0);
            ////expect(json.username).to.equal('marquis');
            //return done();
        //});
    //});
});

describe('testing notification microservice', function() {
    var flushNotificationSpy, loadNotificationSpy;
    before(function() {
        flushNotificationSpy = sinon.spy(NotifService.prototype, 'flushNotificationService');
        loadNotificationSpy = sinon.spy(NotifService.prototype, 'loadNotificationService');
        //listen.start();
    });

    after(function() {
        NotifService.prototype.flushNotificationService.restore();
        NotifService.prototype.loadNotificationService.restore();
    });

    it('should load correct number of notifications for user', function(done) {
        var clean_client = new CleanClient();
        var notifRequest = new NotifRequest(clean_client.genClient());
        notifRequest.loadNotificationRequest('01a640ac73db164a5c41baad0c9d76f2', 'marquis', function(channel, json) {
            expect(json).to.equal(0);
            clean_client.cleanup();
            return done();
        });
    });

    it('should not load notifications for bogus user', function(done) {
        var clean_client = new CleanClient();
        var notifRequest = new NotifRequest(clean_client.genClient());
        notifRequest.loadNotificationRequest('01a640ac73db164a5c41baad0c9d76f2', 'ererer', function(channel, json) {
            expect(json).to.equal(null);
            clean_client.cleanup();
            return done();
        });

    });

    it('should not load notifications for bogus chat', function(done) {
        var clean_client = new CleanClient();
        var notifRequest = new NotifRequest(clean_client.genClient());
        notifRequest.loadNotificationRequest('arto98745gnnvmvm', 'marquis', function(channel, json) {
            expect(json).to.equal(null);
            clean_client.cleanup();
            return done();
        });

    });

    it('should flush notifications correctly for correct username', function(done) {
        var clean_client = new CleanClient();
        var notifRequest = new NotifRequest(clean_client.genClient());
        notifRequest.flushNotificationRequest('46215e0b555f8be7', 'marquis', function(channel, json) {
            //nobody else in chat
            expect(json.affectedRows).to.equal(0);
            clean_client.cleanup();
            return done();
        });

    });
    
    it('should not flush notifications for bogus chat', function(done) {
        var clean_client = new CleanClient();
        var notifRequest = new NotifRequest(clean_client.genClient());
        notifRequest.flushNotificationRequest('asdfkuanwer', 'marquis', function(channel, json) {
            expect(json.affectedRows).to.equal(0);
            clean_client.cleanup();
            return done();
        });

    });

    it('should not flush notifications for bogus user', function(done) {
        var clean_client = new CleanClient();
        var notifRequest = new NotifRequest(clean_client.genClient());
        notifRequest.flushNotificationRequest('46215e0b555f8be7', 'awerlkuynaernl', function(channel, json) {
            expect(json.affectedRows).to.equal(0);
            clean_client.cleanup();
            return done();
        });
    });
});
