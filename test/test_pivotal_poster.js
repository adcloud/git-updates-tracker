var http_mock = function() {};
var vows = require('vows'),
	assert = require('assert'),
	EventEmitter = require('events').EventEmitter,
	pivotal_poster = require('../pivotal_poster')(http_mock);

//mocks
var request = function() {};
request.write = function(data) {
	this.data = data;
};
request.end = function() {};
var res = new EventEmitter();
res.setEncoding = function() {};
var http_callback;
http_mock.request = function(options, cb) {
	http_callback = cb;
	return request;
};
	
vows.describe('Pivotal Poster').addBatch({	
	'prepare message for pivotal': {
		topic: function	 () {
			var story_id = "123";
			var message = "super geil";
			var refname = "my branch";
			var author = "der held vom erdbeerfeld";
			var hash = "631794a3473f51b1807da9c8be705c3ff6e35820";
			pivotal_poster.prepareMessageForPivotal(story_id, message, refname, author, hash, this.callback);
		}, 
		'should result in some stupid xml': function (err, post_msg, story_id) {
			assert.equal ('123', story_id);
			assert.equal (post_msg, '<source_commit><message>Branch:my branch\nsuper geil</message><author>der held vom erdbeerfeld</author><commit_id>631794a3473f51b1807da9c8be705c3ff6e35820</commit_id></source_commit>')
		}
	}
	,
	'a successfull post to pivotal' : {
		topic: function () {
			var message = "<message>hello</message>";
			pivotal_poster.postToPivotal(message, '123', this.callback);
			res.statusCode = 200;
			http_callback(res);
			res.emit('end');
		},
		'should result in an approriate message' : function (msg) {
			assert.equal ('Post success for 123', msg)
			assert.equal ('<message>hello</message>', request.data);
		}
	}
})
.export(module);