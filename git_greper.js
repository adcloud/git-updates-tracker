var	  util = require('util')
	, exec = require('child_process').exec;
	
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

exports.readStdIn = readStdIn;
exports.grepHashesAndRef = grepHashesAndRef;
exports.gitLogAuthorAndMessage = gitLogAuthorAndMessage;