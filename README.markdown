# About

A utility to inform the PivotalTracker.com of Git pushes. Iterates over commits and posts infos if it consists a vaild story number: [#123123]

# Installation

Install Node.JS

Enter a PivotalTracker Token in tracker_token.js & and move all the files in .git/hooks of the rep that receives pushes. 

# Usage

The commit messages have to contain a valid story number like: '[#123123] a message' or 'see 123 a message' or 'a message see #123'

# Run tests

vows test/*


# Run manual tests
 - cp * ~/tmp/sample-origin/.git/hooks/
 - echo "abc" >> test.dat; git add test.dat; git commit -m "[#12535165] xxx"; git push;

# TODOs
- Find the right commits if its a new branch. http://stackoverflow.com/questions/3511057/git-receive-update-hooks-and-new-branches
- Use Notation: see #123, closes #123, fixes #123

