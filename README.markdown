# About

A utility to inform the PivotalTracker.com of Git pushes. Iterates over commits and posts infos if it finds a vaild story.

# Installation

Install Node.JS

Enter a PivotalTracker Token in tracker_token.js & and move all the files in .git/hooks of the rep that receives pushes. 

# Usage

The commit messages have to contain a valid story number like: '[#123123] a message' or 'see 123 a message' or 'a message see #123'

# Run tests

vows test/*


# Helpful commands for manual tests
- cp -r * ~/tmp/sample-origin/.git/hooks/
- echo "abc" >> test.dat; git add test.dat; git commit -a
- echo "abc" >> test.dat; git add test.dat; git commit -m "[#12535165] xxx"; git push;
- git branch feature/another-11; git checkout feature/another-11; echo "abc" >> test.dat; git add test.dat; git commit -m "see, this is new\n\n * see #434"; git push -u origin feature/another-11:feature/yet-another-branch-11;

## Limitations
- Only uses last commit if its a new branch.
- Only looks for the first storyid

## TODOs
- Find all the right commits if its a new branch. http://stackoverflow.com/questions/3511057/git-receive-update-hooks-and-new-branches
- Aggregates commits
- Use semantics behond notations like: closes #123, fixes #123

0d35ef1882fcdd1f92df935dc315938578139ef8