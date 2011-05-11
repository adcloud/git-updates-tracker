var countAndCall = function(nr_of_calls, cb) {
	var called = 0;
	var mock = function() {
		called++;
		if(called === nr_of_calls) {
			cb.apply(cb, arguments);
		}
	}
	return mock;
}
exports.countAndCall = countAndCall;