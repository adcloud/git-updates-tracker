var vows = require('vows'),
	assert = require('assert'),
	update_tracker = require('../update_tracker'),
	countAndCall = require('../testlib/util').countAndCall;

vows.describe('Update Tracker').addBatch({
	'grep hashes and refs from a single commit line': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n';
			update_tracker.grepHashesAndRef(this.callback, git_commit_line);
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
			update_tracker.grepHashesAndRef(countAndCall(2, this.callback), git_commit_line);
		}, 
		'second line is parsed': function (err, oldHash, newHash, refName) {
			assert.equal ('234234', oldHash);
			assert.equal ('qweqwe', newHash);
			assert.equal ('rtzrtz', refName);
		}
	}
})
.export(module); // Export the Suite