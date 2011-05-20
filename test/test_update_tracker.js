var vows = require('vows'),
	assert = require('assert'),
	update_tracker = require('../update_tracker');
	
vows.describe('Update Tracker').addBatch({
	'grep hashes and refs from a single commit line': {
		topic: function	 () {
			var git_commit_line = '123123 abcdef xyzxyz\n';
			update_tracker.grepHashesAndRef(git_commit_line, this.callback);
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
			update_tracker.grepHashesAndRef(git_commit_line, countAndCall(2, this.callback));
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
			update_tracker.gitLogAuthorAndMessage(old_hash, new_hash, refname, this.callback);
		}, 
		'commit message from one line is fetched': function (err, story_id, message, refname, author, hash) {
			assert.equal ('123', story_id);
			assert.equal ('[#123] testcommit', message);
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
			update_tracker.gitLogAuthorAndMessage(oldHash, newHash, refname, this.callback);
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
	'prepare message for pivotal': {
		topic: function	 () {
			var story_id = "123";
			var message = "super geil";
			var refname = "my branch";
			var author = "der held vom erdbeerfeld";
			var hash = "631794a3473f51b1807da9c8be705c3ff6e35820";
			update_tracker.prepareMessageForPivotal(story_id, message, refname, author, hash, this.callback);
		}, 
		'should result in some stupid xml': function (err, post_msg, story_id) {
			assert.equal ('123', story_id);
			assert.equal (post_msg, '<source_commit><message>Branch:my branch\nsuper geil</message><author>der held vom erdbeerfeld</author><commit_id>631794a3473f51b1807da9c8be705c3ff6e35820</commit_id></source_commit>')
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