var https = require('https')
  , exec = require('child_process').exec
  , async = require('./async');
var API_TOCKEN = require('./tracker_token');

async.waterfall([
	
	function read(callback) {
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		var input = "";
		process.stdin.on('data', function (chunk) { input += chunk; });
		process.stdin.on('end', function() { callback(null, input) } );	
	},
	
	function grepHashesAndRef(input, callback) {
		var lines = input.split('\n');
		var line = lines[0].split(' '); //currently only first ref
		var oldHash = line[0];
		var newHash = line[1];
		var refName = line[2];
		callback(null, oldHash, newHash, refName);
	},
	
	function grepAuthorAndMessage(oldHash, newHash, refName, callback) {
		exec("git log -n 1 --pretty=format:'%an @@ %s' ", function (err, logMsg) {
			var logMsgs = logMsg.split(' @@ ');
			var author = logMsgs[0];
			var message = logMsgs[1];
			callback(null, message, refName, author, oldHash, newHash);
		})
	},
	
	function postToPivotal (message, refName, author, oldHash, newHash, callback) {
		var post_msg = 
			'<source_commit>'
			+ '<message>Branch:' + refName + '\n' + message + '</message>'
			+ '<author>' + author + '</author>'
			+ '<commit_id>'+ oldHash + ".." + newHash + '</commit_id>'
			+ '</source_commit>';

		var options = {
			host: 'www.pivotaltracker.com',
			path: '/services/v3/source_commits',
			method: 'POST',
			headers: {'X-TrackerToken' : API_TOCKEN
					, 'Content-type': 'application/xml'
					, 'Content-length': post_msg.length}
		};

		//console.log(post_msg);

		var req = https.request(options, function(res) {
			var data = '';
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function (chunk) {
				//console.log(data);
			});
		});
		req.write(post_msg);
		req.end();
	}
]);


