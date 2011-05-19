# About

A utility to inform the PivotalTracker.com of Git pushes. Iterates over commits and posts infos if it consists a vaild story number: [#123123]

# Installation

Install Node.JS

Enter a PivotalTracker Token in tracker_token.js & and move all the files in .git/hooks of the rep that receives pushes. 

# Usage

The commit messages have to contain a valid story number like: [#123123]

# TODOs
- Find the right commits if its a new branch. http://stackoverflow.com/questions/3511057/git-receive-update-hooks-and-new-branches
- Use Notation: see #123, closes #123, fixes #123
