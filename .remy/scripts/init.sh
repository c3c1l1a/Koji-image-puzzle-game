#!/bin/bash

pushd /usr/src/app

echo "Initializing project"

# If there's already a .git directory, we don't need to do anything
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" ]; then
  echo "Project is already initialized"
  exit 0
fi

# If we don't have a source repo as the arg, just git init and exit
if [ $# -eq 0 ]; then
  echo "No source specified, initializing empty git repository"
  git init
else
  # If we do have a source, clone the source
  # We need to do it like this instead of with `git clone` because
  # the directory we're cloning into is not empty, it already has
  # the .koji/ stubs and the Dockerfile inside it, which is what
  # lets us get to this step.
  echo "Cloning from $1"
  git init .
  git remote add -t \* -f upstream $1
  git reset --hard upstream/master

  # If the source stubs have hooks, execute them
  if [ -f .koji/hooks/post-clone.sh ]; then
    echo "Running post-clone script"
    sh .koji/hooks/post-clone.sh
  fi
fi
