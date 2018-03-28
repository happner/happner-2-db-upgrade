var path = require('path');

describe('CHECK NO UPGRADE', function () {

  var Promise = require('bluebird');

  var async = require('async');

  this.timeout(60000);

  var expect = require('expect.js');

  var USER_COUNT = 100;

  it('interrogates the mongodb directly ascertaining that there are updated permissions records', function (done) {

    var url = "mongodb://localhost:27017";

    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(url, function(err, client) {

      if (err) return callback(err);

      var db = client.db("happner-2-db-upgrade-test");

      var collection = db.collection("happner-2-db-upgrade-test");

      collection.find({'path': {$regex: new RegExp('/_SYSTEM/_SECURITY/_PERMISSIONS/.*')}}).toArray(function(e, array){
        client.close();
        if (e) return done(e);
        expect(array.length).to.be(0);
        done();
      });
    });
  });
});
