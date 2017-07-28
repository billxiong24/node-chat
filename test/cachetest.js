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
var cache_functions = require('../app/cache/cache_functions.js');

describe('test for cache functions, quick tests since just calls API', function() {
    it('should not set string value, since value is null', function(done) {
        cache_functions.addValue('test', null, function(err, reply) {
            expect(reply).to.equal(undefined);
            return done();
        });
    });

    it('should properly set a string value with expire time', function(done) {
        cache_functions.addValue('test', 'test2', function(err, reply) {
            expect(reply).to.equal("OK");
            return done();
        }, 100);
    });

    it('retrieve value properly', function(done) {
        cache_functions.retrieveValue('test', function(err, reply) {
            expect(reply).to.equal('test2');
            return done();
        });
        
    });

    it('should delete key properly', function(done) {
        cache_functions.deleteKey('test', function(err, reply) {
            expect(reply).to.equal(1);
            return done();
        });
    });

    it('should return 0 since key was not present when deleted', function(done) {
        cache_functions.deleteKey('test', function(err, reply) {
            expect(reply).to.equal(0);
            return done();
        });
    });

    it('should add JSON object properly', function(done) {
        cache_functions.addJSON('new:key', {key: 'value1'}, function(err, reply) {
            expect(reply).to.equal('OK');
            return done();
        });
    });
});

describe('test callback and promise versions of these cache_functions', function() {
    it('should retrieve JSON object properly via callback', function(done) {
        cache_functions.retrieveJSON('new:key', function(err, reply) {
            expect(reply).to.not.equal(null);
            expect(reply).to.have.property('key');
            expect(reply.key).to.equal('value1');
            return done();
        });
    });

    it('should retrieve JSON object via promise', function(done) {
        cache_functions.retrieveJSON('new:key', null, true)
        .then(function(result) {
            expect(result).to.not.equal(null);
            expect(result).to.have.property('key');
            expect(result.key).to.equal('value1');
            return done();
        });
    });

    it('should retrieve JSON element via promise', function(done) {
        cache_functions.retrieveJSONElement('new:key', 'key', function(err, result) {
            expect(result).to.not.equal(null);
            expect(result).to.equal('value1');
            return done();
        });
    });

    it('retrieve should handle null value errors', function(done) {
        cache_functions.retrieveJSONElement('new:key', 'random', function(err, result) {
            expect(result).to.equal(null);
            return done();
        });
    });
    it('retrieve should handle null key errors', function(done) {
        cache_functions.retrieveJSONElement('random key', 'random', function(err, result) {
            expect(result).to.equal(null);
            return done();
        });
    });

    it('should retrieve JSON element via promise', function(done) {
        cache_functions.retrieveJSONElement('new:key', 'key', null, true)
        .then(function(result) {
            expect(result).to.not.equal(null);
            expect(result).to.equal('value1');
            return done();
        });
    });

    it('should remove a json element using callback', function(done) {
        cache_functions.removeJSONElement('new:key', 'key', function(err, reply) {
            expect(reply).to.equal(1);
            return done();
        });
    });

    it('should remove a json element using promise', function(done) {
        cache_functions.addJSON('akey', {key: 'value'}, function(err, reply) {
            cache_functions.removeJSONElement('akey', 'key', null, true)
            .then(function(reply) {
                expect(reply).to.equal(1);
                return done();
            });
        });
    });
    it('should handle a non existent delete', function(done) {
        cache_functions.removeJSONElement('akey', 'key', function(err, reply) {
            expect(reply).to.equal(0);
            return done();
        });
    });

    it('should add a json element via callback , even if key does not exist', function(done) {

        cache_functions.addJSONElement('randokey', 'jsonkey', 'jsonelement', function(err, reply) {
            expect(reply).to.equal(1);
            return done();
        });
    });

    it('should add a json element via promise, even if key does not exist', function(done) {

        cache_functions.addJSONElement('randokey', 'jsonkey', 'werwer', null, true).then(function(reply) {
            expect(reply).to.equal(0);
            return done();
        });
    });

    it('should increment a json element via promise, even if key does not exist', function(done) {
        cache_functions.incrementJSONElement('randomkey', 'some element', 23, null, true)
        .then(function(reply) {
            expect(reply).to.equal(23);
            return done();
        });
    });
});
