var vows = require('vows'),
	assert = require('assert'),
	update_tracker = require('../update_tracker');
	
vows.describe('Pivotal Poster').addBatch({	
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
.export(module);