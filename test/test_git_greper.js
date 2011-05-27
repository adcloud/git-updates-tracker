var vows = require('vows'),
	assert = require('assert'),
	git_greper = require('../git_greper');
	
vows.describe('Update Tracker').addBatch({
	'grep hashes and refs from a single commit line': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n';
			git_greper.grepHashesAndRef(git_commit_line, this.callback);
		}, 
		'are parsed': function (err, old_hash, new_hash, refName) {
			assert.equal ('123123', old_hash);
			assert.equal ('abcdef', new_hash);
			assert.equal ('xyzxyz', refName);
		}
	}
	,
	'grep hashes and refs from multiple commit lines': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n234234 qweqwe rtzrtz\n';
			git_greper.grepHashesAndRef(git_commit_line, countAndCall(2, this.callback));
		}, 
		'second line is parsed': function (err, old_hash, new_hash, refname) {
			assert.equal ('234234', old_hash);
			assert.equal ('qweqwe', new_hash);
			assert.equal ('rtzrtz', refname);
		}
	}
	,
	'git log author and message from one commit': {
		topic: function	 () {
			var old_hash = "1a798f52394ca7958404b0c5b870fe6f2d2cbf04";
			var new_hash = "631794a3473f51b1807da9c8be705c3ff6e35820";
			var refname = "my branch";
			git_greper.gitLogAuthorAndMessage(old_hash, new_hash, refname, this.callback);
		}, 
		'commit message from one line is fetched': function (err, story_id, message, refname, author, hash) {
			assert.equal ('123', story_id);
			assert.equal (message, '[#123] testcommit');
			assert.equal ('my branch', refname);
			assert.equal ('Matthias Luebken', author);
			assert.equal ("631794a3473f51b1807da9c8be705c3ff6e35820", hash);
		}
	}
	,
	'git log author and message for new branch': {
		topic: function	 () {
			var oldHash = "000000000000000000000000";
			var newHash = "631794a3473f51b1807da9c8be705c3ff6e35820";
			var refname = "my branch";
			git_greper.gitLogAuthorAndMessage(oldHash, newHash, refname, this.callback);
		}, 
		'commit message from is fetched': function (err, story_id, message, refname, author, hash) {
			assert.equal ('123', story_id);
			assert.equal ('[#123] testcommit', message);
			assert.equal ('my branch', refname);
			assert.equal ('Matthias Luebken', author);
			assert.equal ("631794a3473f51b1807da9c8be705c3ff6e35820", hash);
		}
	}
	,
	'git log supports see syntax': {
		topic: function	 () {
			var old_hash = "8731700838bcb1eb2418a0fce86a733023b7a2a0";
			var new_hash = "5fbc831a09cca712c9bcb5d260b1242f7ed5acd8";
			var refname = "my branch";
			git_greper.gitLogAuthorAndMessage(old_hash, new_hash, refname, this.callback);
		}, 
		'story id is extracted from a see message message ': function (err, story_id, message, refname, author, hash) {
			assert.equal ('my branch', refname);
			assert.equal ('Matthias Luebken', author);
			assert.equal ('[#123] testmessage', message);
			assert.equal (story_id, '123');
		}
	}
	,
	'build message with see syntax': {
		topic: git_greper.buildMessage('see #123 testmessage'), 
		'should result in a tracker conform message': function (message) {
			assert.equal ('[#123] testmessage', message);
		}
		,
		topic: git_greper.buildMessage('see 123 testmessage'), 
		'should result in a tracker conform message': function (message) {
			assert.equal ('[#123] testmessage', message);
		}
		,
		topic: git_greper.buildMessage('testmessage see 123'), 
		'should result in a tracker conform message': function (message) {
			assert.equal ('[#123] testmessage', message);
		}
		,
		topic: git_greper.buildMessage('testmessage See 123'), 
		'should result in a tracker conform message': function (message) {
			assert.equal (message, '[#123] testmessage');
		}
		,
		topic: git_greper.buildMessage('see, this is awesome\n* see #12535165'), 
		'should result in a tracker conform message': function (message) {
			assert.equal (message, '[#12535165] see, this is awesome\n*');
		}
		,
		topic: git_greper.buildMessage('see, this is awesome\n* see #12535165\n* see #12535165'), 
		'should result in a tracker conform message': function (message) {
			assert.equal (message, '[#12535165] see, this is awesome\n* \n*');
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