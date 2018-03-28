var path = require('path');

describe('TEST PERMISSIONS PREVIOUS', function () {

  var Promise = require('bluebird');

  var async = require('async');

  var request = Promise.promisify(require('request'));

  this.timeout(60000);

  var expect = require('expect.js');

  var Mesh = require('happner-2');

  var adminClient = new Mesh.MeshClient({secure: true, test: "adminClient"});

  var testUserClient = new Mesh.MeshClient({secure: true, test: "testUserClient"});

  var USER_COUNT = 100;

  var testUsers = [];

  for (var i = 0; i < USER_COUNT; i++) {

    testUsers.push({
      username: 'TEST GROUP' + i.toString(),
      password: 'TEST PWD',
      custom_data: {
        groupId: i
      }
    })
  }

  before('logs in with the admin user', function (done) {

    // Credentials for the login method
    var credentials = {
      username: '_ADMIN', // pending
      password: 'happn'
    };

    adminClient.login(credentials).then(function () {
      done();
    }).catch(done);

  });

  after('logs out', function (done) {
    adminClient.disconnect(function (e) {
      done(e);
    }, 99);
  });

  var testSessions = [];

  after('logs test sessions out', function (done) {

    async.eachSeries(testSessions, function (testSession, callback) {

      testSession.disconnect({reconnect: false}, callback);
    }, done);
  });

  it('logs in with the test users', function (done) {

    async.eachSeries(testUsers, function (testUser, callback) {

      var session = new Mesh.MeshClient({secure: true, test: "testUserClient"});

      session.login(testUser).then(function () {

        testSessions.push(session);
        callback();
      }).catch(callback);

    }, done);
  });

  it('tests the permissions with the test users', function (done) {

    async.eachSeries(testSessions, function (testSession, callback) {

      testSession.exchange.test.method1('TESTARG')
        .then(function (response) {

          return new Promise(function (resolve, reject) {
            testSession.event.test.on('event1', function (data) {

            }, function (e) {
              if (e) return reject(e);
              resolve();
            })
          })
        })
        .then(function () {

          return new Promise(function (resolve, reject) {
            testSession.exchange.test.method2('TESTARG', function (e) {

              if (!e || e.toString() != 'AccessDenied: unauthorized') return reject(new Error('no error or no access denied error'));

              resolve();
            })
          })
        })
        .then(function () {

          return new Promise(function (resolve, reject) {
            testSession.event.test.on('event2', function (data) {

            }, function(e){

              if (!e || e.toString() != 'AccessDenied: unauthorized') return reject(new Error('no error or no access denied error'));

              resolve();
            })
          })
        })
        .then(function () {

          return new Promise(function (resolve, reject) {
            testSession.exchange.test.method3('TESTARG', function (e) {

              if (!e || e.toString() != 'AccessDenied: unauthorized') return reject(new Error('no error or no access denied error'));

              resolve();
            })
          })
        })
        .then(function () {

          return new Promise(function (resolve, reject) {
            testSession.event.test.on('event3', function (data) {

            }, function(e){

              if (!e || e.toString() != 'AccessDenied: unauthorized') return reject(new Error('no error or no access denied error'));

              resolve();
            })
          })
        })
        .then(callback)
        .catch(callback)

    }, done);
  });
});
