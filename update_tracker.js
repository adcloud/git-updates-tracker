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
		var old_hash = line[0];
		var new_hash = line[1];
		var refname = line[2];
		
		callback(null, old_hash, new_hash, refname);
	}
}

/**
 * Get author and message via git log
 */
function gitLogAuthorAndMessage (old_hash, new_hash, refname, callback) {
	var range = old_hash + ".." + new_hash;
	if(old_hash.match(/^00000/)){//new branch
		console.log('Looks like a new branch. Only using last commit.')
		range = new_hash + " -n 1";
	}
	exec("git log " + range + " --pretty=format:'%H @@ %an @@ %s' ", function (err, data) {
		var logCommits = data.split('\n');
		for (var i=0; i < logCommits.length; i++) {
			var commit = logCommits[i].split(' @@ ');
			var hash = commit[0];
			var author = commit[1];
			var message = commit[2];
			var message_contains_story_id = message.match(/\[\#(.*)\]/);
			if(message_contains_story_id) {
				(function (message, refname, author, hash) {
					setTimeout(function() { 
						callback(null, message_contains_story_id[1], message, refname, author, hash) 
					}, i * 1200);
				})(message, refname, author, hash);
			} else {
				console.log('No story found for commit ' + hash);
			}
		}		
	})
}

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
			var success =  (res.statusCode === 200) ? 'success for ' : 'failed ';
			callback('Post ' + success + story_id);
			if(res.statusCode !== 200) {
				callback(data);
			}			
		});
	});
	req.write(post_msg);
	req.end();
}

async.waterfall([readStdIn, grepHashesAndRef, gitLogAuthorAndMessage, prepareMessageForPivotal, postToPivotal], function(msg) {
	console.log(msg);
});

//exports for tests
exports.grepHashesAndRef = grepHashesAndRef;
exports.gitLogAuthorAndMessage = gitLogAuthorAndMessage;
exports.prepareMessageForPivotal = prepareMessageForPivotal;


