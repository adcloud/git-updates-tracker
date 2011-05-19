var https = require('https')
	, util = require('util')
	, exec = require('child_process').exec
	, async = require('async')
var API_TOCKEN = require('./tracker_token');

/**
 * Read from Stdin. Input should be Git from a post-receive.
 */
function readStdIn (callback) {
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	var input = "";
	process.stdin.on('data', function (chunk) { input += chunk; });
	process.stdin.on('end', function() { callback(null, input); });
}

/**
 * Grep hashes and ref from Gits post-receive input.
 */
function grepHashesAndRef (input, callback) {	
	var lines = input.split('\n');
	lines.pop();//remove last empty line
	for (var i=0; i < lines.length; i++) {
		var line = lines[i].split(' ');
		var oldHash = line[0];
		var newHash = line[1];
		var refName = line[2];
		
		callback(null, oldHash, newHash, refName);
	}
}

/**
 * Get author and message via git log
 */
function gitLogAuthorAndMessage (oldHash, newHash, refname, callback) {
	exec("git log " + oldHash + ".." + newHash + " --pretty=format:'%H @@ %an @@ %s' ", function (err, data) {
		var logCommits = data.split('\n');
		for (var i=0; i < logCommits.length; i++) {
			var commit = logCommits[i].split(' @@ ');
			var hash = commit[0];
			var author = commit[1];
			var message = commit[2];
			var messageContainsStoryId = message.match(/\[\#.*\]/);
			if(messageContainsStoryId) {
				(function (message, refname, author, hash) {
					setTimeout(function() { 
						callback(null, message, refname, author, hash) 
					}, i * 1200);
				})(message, refname, author, hash);
			}
		}		
	})
}

/**
 * Posts the informations to PivotalTracker
 */
function postToPivotal (message, refName, author, hash, callback) {
	var post_msg = 
	'<source_commit>'
	+ '<message>Branch:' + refName + '\n' + message + '</message>'
	+ '<author>' + author + '</author>'
	+ '<commit_id>' + hash + '</commit_id>'
	+ '</source_commit>';

	var options = {
		host: 'www.pivotaltracker.com',
		path: '/services/v3/source_commits',
		method: 'POST',
		headers: {'X-TrackerToken' : API_TOCKEN
		, 'Content-type': 'application/xml'
		, 'Content-length': post_msg.length}
	};

	console.log('Start posting: ' + hash + " " + message);
	callback("finish");
	
	/*
	var req = https.request(options, function(res) {
		var data = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function (chunk) {
			var success =  (res.statusCode === 200) ? 'success: ' : 'failed: ';
			callback('Post ' + success + hash + " " + message);
			if(res.statusCode !== 200) {
				callback(data);
			}
			
		});
	});
	req.write(post_msg);
	req.end();
	*/
}
console.log('starting update_tracker...');
async.waterfall([readStdIn, grepHashesAndRef, gitLogAuthorAndMessage, postToPivotal], function(msg) {
	console.log(msg);
});

//exports for tests
exports.grepHashesAndRef = grepHashesAndRef;
exports.gitLogAuthorAndMessage = gitLogAuthorAndMessage;


