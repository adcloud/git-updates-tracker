var vows = require('vows'),
	assert = require('assert');
var update_tracker = require('../update_tracker');

vows.describe('Update Tracker').addBatch({
	'hashes and refs in a single commit': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n';
			update_tracker.grepHashesAndRef(git_commit_line, this.callback);
		}, 
		'are parsed': function (err, oldHash, newHash, refName) {
			assert.equal ('123123', oldHash);
			assert.equal ('abcdef', newHash);
			assert.equal ('xyzxyz', refName);
		}
	},
	'hashes and refs in multiple commits': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n234234 qweqwe rtzrtz\n';
			update_tracker.grepHashesAndRef(git_commit_line, this.callback);
		}, 
		'first line is parsed': function (err, oldHash, newHash, refName) {
			assert.equal ('123123', oldHash);
			assert.equal ('abcdef', newHash);
			assert.equal ('xyzxyz', refName);
		},
		'second line is parsed': function (err, oldHash, newHash, refName) {
			assert.equal ('234234', oldHash);
		}
	}
})
.export(module); // Export the Suite