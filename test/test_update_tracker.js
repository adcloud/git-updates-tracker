var vows = require('vows'),
	assert = require('assert'),
	update_tracker = require('../update_tracker');
	
vows.describe('Update Tracker').addBatch({
	'grep hashes and refs from a single commit line': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n';
			update_tracker.grepHashesAndRef(git_commit_line, this.callback);
		}, 
		'are parsed': function (err, oldHash, newHash, refName) {
			assert.equal ('123123', oldHash);
			assert.equal ('abcdef', newHash);
			assert.equal ('xyzxyz', refName);
		}
	}
	,
	'grep hashes and refs from multiple commit lines': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n234234 qweqwe rtzrtz\n';
			update_tracker.grepHashesAndRef(git_commit_line, countAndCall(2, this.callback));
		}, 
		'second line is parsed': function (err, oldHash, newHash, refName) {
			assert.equal ('234234', oldHash);
			assert.equal ('qweqwe', newHash);
			assert.equal ('rtzrtz', refName);
		}
	}
	,
	'git log author and message from one commit': {
		topic: function	 () {
			var oldHash = "1a798f52394ca7958404b0c5b870fe6f2d2cbf04";
			var newHash = "631794a3473f51b1807da9c8be705c3ff6e35820";
			var refname = "my branch";
			update_tracker.gitLogAuthorAndMessage(oldHash, newHash, refname, this.callback);
		}, 
		'commit message from one line is fetched': function (err, message, refname, author, hash) {
			assert.equal ('[#123] testcommit', message);
			assert.equal ('my branch', refname);
			assert.equal ('Matthias Luebken', author);
			assert.equal ("631794a3473f51b1807da9c8be705c3ff6e35820", hash);
		}
	}
})
.export(module); // Export the Suite

//utils: 
var countAndCall = function(nr_of_calls, cb) {
	var called = 0;
	return function() {
		called++;
		if(called === nr_of_calls) {
			cb.apply(cb, arguments);
		}
	}
}