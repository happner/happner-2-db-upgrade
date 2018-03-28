var Happner = require('happner-2');

//var heapdump = require('heapdump');

var mesh = new Happner();

function act(message, cb){

  // if (message == 'GC'){
  //   if (global.gc) {
  //     global.gc();
  //     console.log('ON SERVER GC:::');
  //     return cb();
  //   } else {
  //     return cb(new Error('Garbage collection unavailable.  Pass --expose-gc '));
  //   }
  // }
  //
  // if (message == 'HEAP-DMP-BASELINE')
  //   return heapdump.writeSnapshot(__dirname + '/heap-dumps/0.baseline.heapsnapshot', function (err, filename) {
  //     console.log('dump written to', filename);
  //     cb();
  //   });
  //
  //
  // if (message.indexOf('HEAP-DMP-POST-TESTS') == 0){
  //   console.log('ON SERVER HEAP DMP:::');
  //   var heapDumpNumber = message.split('_')[1];
  //   return heapdump.writeSnapshot(__dirname + '/heap-dumps/' + heapDumpNumber + '.post-tests.heapsnapshot', function(err, filename) {
  //     console.log('dump written to', filename);
  //     cb();
  //   });
  // }

  cb(new Error('unknown message type: ' + message))
}

process.on('message', function(data){

  act(data.message, function(e){

    console.log('REPLYING:::', {
      handle:data.handle,
      status: e || 'ok'
    });

    process.send({
      handle:data.handle,
      status: e || 'ok'
    });
  });
});

mesh.initialize({
  name: 'happner-2-db-upgrade-test',
  happn: {
    secure: true,
    services: {
      data: {
        config: {
          autoUpdateDBVersion:true,
          datastores: [
            {
              name: 'happner-2-db-upgrade-test',
              provider:'happn-service-mongo-2',
              isDefault: true,
              settings: {
                collection: 'happner-2-db-upgrade-test',
                database: 'happner-2-db-upgrade-test',
                url:'mongodb://127.0.0.1:27017',
                sslValidate: false,
                acceptableLatencyMS: 5000
              }
            }
          ]
        }
      }
    }
  },
  modules: {
    "test": {
      path: __dirname + '/components/test'
    }
  },
  components: {
    "test": {}
  }
}, function (e) {

  var trySend = function(msg){

    if (process.send) process.send(msg);
  };

  if (e) return trySend('SERVICE START FAILED: ' + e.toString());

  mesh.start(function (e) {

    if (e) return trySend('SERVICE START FAILED: ' + e.toString());

    trySend('STARTED');
  });
});