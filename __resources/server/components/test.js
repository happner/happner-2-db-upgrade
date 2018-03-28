module.exports = TestComponent;

function TestComponent() {
}

TestComponent.prototype.method1 = function ($happn, args, callback) {

  callback(null, args);
};

TestComponent.prototype.method2 = function ($happn, args, callback) {

  callback(null, args);
};

TestComponent.prototype.method3 = function ($happn, args, callback) {

  callback(null, args);
};

TestComponent.prototype.event1 = function ($happn, args, callback) {

  $happn.emit(args.eventKey, args, {}, callback);
};

TestComponent.prototype.event2 = function ($happn, args, callback) {

  $happn.emit(args.eventKey, args, {}, callback);
};

TestComponent.prototype.event3 = function ($happn, args, callback) {

  $happn.emit(args.eventKey, args, {}, callback);
};

TestComponent.prototype.webmethod1 = function ($happn, args, callback) {

  callback(null, args);
};


