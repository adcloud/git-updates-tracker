/* A util module to chain functions in series. */

/* Classical partial function */
// return a function, which will be called with
// the arguments passed to partial
// & concated with the arguments when its called
Function.prototype.partial = function() {
	var funct = this, //a user function
		args = Array.prototype.slice.call(arguments); //make an array
		
	return function() {
		funct.apply(null, Array.prototype.concat.apply(args, arguments));
	};
};

module.exports = function chainEm(/* f1, f2, f3 */) {
	var functions = Array.prototype.slice.call(arguments);
	var chain = function () {};
	for (var i = functions.length - 1; i >= 0; i--) {
		chain = functions[i].partial(chain);
	}
	chain();
}