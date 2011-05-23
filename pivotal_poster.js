var API_TOCKEN = require('./tracker_token');

//optional injection of http for mocking
module.exports = function(https) {
	if(!https) https = require('https');

	function prepareMessageForPivotal(story_id, message, refname, author, hash, callback) {
		var post_msg = 
		'<source_commit>'
		+ '<message>Branch:' + refname + '\n' + message + '</message>'
		+ '<author>' + author + '</author>'
		+ '<commit_id>' + hash + '</commit_id>'
		+ '</source_commit>';
		callback(null, post_msg, story_id);
	}

	/**
	* Posts the informations to PivotalTracker
	*/
	function postToPivotal (post_msg, story_id, callback) {
		var options = {
			host: 'www.pivotaltracker.com',
			path: '/services/v3/source_commits',
			method: 'POST',
			headers: {'X-TrackerToken' : API_TOCKEN
			, 'Content-type': 'application/xml'
			, 'Content-length': post_msg.length}
		};

		console.log('Start posting for story ' + story_id);

		var req = https.request(options, function(res) {
			var data = '';
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function (chunk) {
				var success =  (res.statusCode === 200) ? 'success for ' : 'failed for ';
				callback(null, 'Post ' + success + story_id);
			});
		});
		req.write(post_msg);
		req.end();
	}

	return { 
		  prepareMessageForPivotal: prepareMessageForPivotal
		, postToPivotal: postToPivotal 
	};
}