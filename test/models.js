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

chai.use(chaiHttp);
var authenticator;

//TODO mock fakeredis so we can test messages properly
//TODO create testing database environment

it('test new file', function(done) {
    return done();
});
