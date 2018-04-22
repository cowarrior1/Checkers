var chai = require('chai');
var expect = chai.expect;
var assert = require('assert');
var should = require('should');
var supertest = require('supertest');
var app = require('../app');
var io = require('socket.io-client');
var socket_url = 'http://0.0.0.0:8080';
var base_url = supertest('http://localhost:8080');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

describe('backendWebTest', function(){
  describe('GET/', function(){
    it('returns status of 200', function(done){
      base_url.get('/')
      .set('Accept', 'application/json')
      .expect(200, done);
    })
    it('go to / homepage', function(done){
      base_url.get('/')
      .set('Accept', 'text/plain')
      .expect(200)
      .end(function(err,res){
        expect(res.text).to.have.string('startGame');
        done();
      })
    })
    it('go to / WaitingScreen', function(done){
      base_url.get('/Waiting')
      .set('Accept', 'text/plain')
      .expect(200)
      .end(function(err,res){
        expect(res.text).to.have.string('dropdown-divider');
        done();
      })
    })
    it('go to / Main', function(done){
      base_url.get('/Main')
      .set('Accept', 'text/plain')
      .expect(200)
      .end(function(err,res){
        expect (res.text).to.have.string('checkerBoard');
        done();
      })
    })
  });
  describe('backendConnectionTest', function(){
    beforeEach(function(done){
      //start the server
      http = require('../app').http;
      done();
    })
    afterEach(function(done){
      //close the server
      http = require('../app').http;
      http.close()
      done();
    })
    it('user1 connections status', function(done){
      ConnectionManager = require('../app').ConnectionManager;
      var client1 = io.connect(socket_url, options);
      client1.on('connect', function(data){
        assert.equal(1, ConnectionManager.connections.length);
      })
      done();
    });
    it('user2 connections status', function(done){
      ConnectionManager = require('../app').ConnectionManager;
      var client1 = io.connect(socket_url, options);
      var client2 = io.connect(socket_url, options);
      client1.on('connect', function(data){
        assert.equal(1, ConnectionManager.connections.length);
      })
      client2.on('connect', function(data){
        assert.equal(2, ConnectionManager.connections.length);
      })
      done();
    })
  })
})
