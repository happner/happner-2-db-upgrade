var path = require('path');

describe('CREATE PERMISSIONS', function () {

  var Promise = require('bluebird');

  var request = Promise.promisify(require('request'));

  this.timeout(60000);

  var async = require('async');

  var expect = require('expect.js');

  var Mesh = require('happner-2');

  var adminClient = new Mesh.MeshClient({secure:true});

  var GROUP_COUNT = 100;
  var USER_COUNT = 100;

  var testGroups = [];
  var savedGroups = [];
  var savedUsers = [];
  var testUsers = [];

  for(var i = 0; i < GROUP_COUNT; i++){

    testGroups.push({
      name: 'TEST GROUP' + i.toString(),

      custom_data: {
        customString: 'custom1',
        customNumber: 0
      },

      permissions: {
        methods: {
          '/test/method1': {authorized: true},
          '/test/method2': {authorized: false}
        },
        events: {
          '/test/event1': {authorized: true},
          '/test/event2': {authorized: false}
        },
        web: {
          '/test/webmethod1': {
            authorized: true,
            actions: [
              'get',
              'put',
              'post',
              'head',
              'delete'
            ]
          }
        }
      }
    });
  }

  for(var i = 0; i < USER_COUNT; i++){

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

    adminClient.login(credentials).then(done).catch(done);

  });

  after('logs out', function (done) {

    adminClient.disconnect(function (e) {
      done(e);
    }, 99);
  });

  it('creates the test groups', function (done) {

    async.eachSeries(testGroups, function(testGroup, callback){

      adminClient.exchange.security.addGroup(testGroup, function(e, group){

        if (e) return callback(e);

        savedGroups.push(group);
        callback();
      });

    }, done);
  });

  it('creates the test users', function (done) {

    async.eachSeries(testUsers, function(testUser, callback){

      adminClient.exchange.security.addUser(testUser, function(e, user){

        if (e) return callback(e);

        savedUsers.push(user);
        callback();
      });

    }, done);
  });

  it('connects users to groups', function (done) {

    var i = 0;

    async.eachSeries(savedUsers, function(testUser, callback){

      adminClient.exchange.security.linkGroup(savedGroups[i], testUser, callback);
      i++;
    }, done);
  });
});
