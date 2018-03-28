var install = require("gulp-install");
var gulp = require('gulp');
var transform = require('gulp-transform');
var runSequence = require('run-sequence');
var exec = require('gulp-exec');

var clientVersion = process.argv[2];
var serverVersion = process.argv[3];
var latestServerVersion = process.argv[4];

function updateVersion(content, file) {

  if (file.path.indexOf('server/package.json'))
    content = content.replace('{{compare-server-version}}', serverVersion);

  if (file.path.indexOf('client/package.json'))
    content = content.replace('{{compare-client-version}}', clientVersion);

  return content;
}

function updateLatestVersion(content, file) {

  if (file.path.indexOf('server/package.json'))
    content = content.replace('{{compare-server-version}}', latestServerVersion);

  if (file.path.indexOf('client/package.json'))
    content = content.replace('{{compare-client-version}}', clientVersion);

  return content;
}

gulp.task('build', function (callback) {

  var sequence = [
    'clear-security-directory',
    'build-previous-server',
    'build-latest-server',
    'build-client',
    'start-previous-server',
    'run-client-security-previous-tests',
    'kill-server',
    'start-latest-server',
    'run-client-security-latest-tests',
    'kill-server'];

  sequence.push(callback);

  runSequence.apply(runSequence, sequence);
});

var child_process = require('child_process');
var server;

var messageHandles = 0;
var messageHandlers = {};

var sendMessage = function (child, message) {

  var sendMessage = {
    handle: messageHandles++,
    message: message
  };

  return new Promise(function (resolve, reject) {

    messageHandlers[sendMessage.handle] = {
      resolve: resolve,
      reject: reject
    };

    child.send(sendMessage);
  })
};

gulp.task('clear-security-directory', function (callback) {

  var url = "mongodb://localhost:27017";

// create a client to mongodb
  var MongoClient = require('mongodb').MongoClient;

// make client connect to mongo service
  MongoClient.connect(url, function(err, client) {

    if (err) return callback(err);

    console.log("Connected to Database!");

    var db = client.db("happner-2-db-upgrade-test");

    db.collection("happner-2-db-upgrade-test").drop(function(err) {
      if (err && err.toString() != "MongoError: ns not found") return callback(err);
      client.close();
      callback();
    });
  });
});

gulp
  .task('build-previous-server', function () {
    return gulp
      .src(__dirname + '/__resources/server/**')
      .pipe(transform('utf8', updateVersion))
      .pipe(gulp.dest(__dirname + '/server/' + serverVersion + '/'))
      .pipe(install());
  });

gulp
  .task('build-latest-server', function () {
    return gulp
      .src(__dirname + '/__resources/server/**')
      .pipe(transform('utf8', updateLatestVersion))
      .pipe(gulp.dest(__dirname + '/server/' + latestServerVersion + '/'))
      .pipe(install());
  });

gulp.task('build-client', function () {
  return gulp
    .src(__dirname + '/__resources/client/**')
    .pipe(transform('utf8', updateVersion))
    .pipe(gulp.dest(__dirname + '/client/' + clientVersion + '/'))
    .pipe(install());
});


gulp.task('start-previous-server', function (callback) {

  server = child_process.fork(__dirname + '/server/' + serverVersion + '/server-start', {execArgv: ['--expose-gc']});

  server.on('message', function (message) {

    console.log('STARTED PREVIOUS:::' + serverVersion);

    console.log('STARTED PREVIOUS:::' + __dirname + '/server/' + serverVersion + '/server-start');

    if (message == 'STARTED') return callback();

    if (message.indexOf && message.indexOf('ERROR') > -1) return callback(new Error('failed to start server'));

    if (message.handle != null && messageHandlers[message.handle] && message.status != null) {

      if (message.status == 'ok') {
        console.log('resolving:::', message);
        messageHandlers[message.handle].resolve(message);
      } else messageHandlers[message.handle].reject(new Error(message.status));

      delete messageHandlers[message.handle];
    }
  });
});

gulp.task('run-client-security-previous-tests', function (callback) {

  console.log('RUNNING PREVIOUS TESTS:::', __dirname + '/client/' + clientVersion + '/tests/previous/**');

  child_process.exec('mocha ' + __dirname + '/client/' + clientVersion + '/tests/previous/** > ' + __dirname + '/client/' + clientVersion + '/results/latest_prev.txt', function (e, stdout, stderr) {

    console.log('calling back:::');

    callback();
  });

});

gulp.task('start-latest-server', function (callback) {

  console.log('STARTING LATEST:::');

  server = child_process.fork(__dirname + '/server/' + latestServerVersion + '/server-start', {execArgv: ['--expose-gc']});

  server.on('message', function (message) {

    console.log('STARTED LATEST:::' + latestServerVersion);

    console.log('STARTED LATEST:::' + __dirname + '/server/' + latestServerVersion + '/server-start');

    if (message == 'STARTED') return callback();

    if (message.indexOf && message.indexOf('ERROR') > -1) return callback(new Error('failed to start server'));

    if (message.handle != null && messageHandlers[message.handle] && message.status != null) {

      if (message.status == 'ok') {
        console.log('resolving:::', message);
        messageHandlers[message.handle].resolve(message);
      } else messageHandlers[message.handle].reject(new Error(message.status));

      delete messageHandlers[message.handle];
    }
  });
});

gulp.task('run-client-security-latest-tests', function (callback) {

  console.log('RUNNING LATEST TESTS:::', __dirname + '/client/' + clientVersion + '/tests/latest/**');

  child_process.exec('mocha ' + __dirname + '/client/' + clientVersion + '/tests/latest/** > ' + __dirname + '/client/' + clientVersion + '/results/latest.txt', function (e, stdout, stderr) {

    console.log('RAN LATEST TESTS:::');
    callback();
  });

});

gulp.task('kill-server', function (callback) {

  server.kill();
  console.log('KILLED SERVER:::');
  callback();
});

gulp.start('build');

