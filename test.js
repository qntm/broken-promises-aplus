var promisesAplusTests = require("promises-aplus-tests");

var Promise = require("./index.js");

// A bit hacky
var adapter = {
	deferred: function() {
		var promise = new Promise();
		promise.testInProgress = true;
		return {
			promise: promise,
			resolve: function(value) {
				promise._settle(1, value);
			},
			reject: function(reason) {
				promise._settle(2, reason);
			}
		};
	}
};

promisesAplusTests(adapter, {bail: true}, function(err) {
	// Errors go to STDERR
	if(err) {
		throw err;
	}
});
