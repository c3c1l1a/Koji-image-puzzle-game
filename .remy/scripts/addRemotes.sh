#!/bin/bash

pushd /usr/src/app

echo "Configuring Git"
git config --global user.name $1
git config --global user.email "$1@koji-projects.com"
git config --global credential.helper "!f() { sleep 1; echo 'username=$1'; echo 'password=$2'; }; f"

echo "Adding git remotes"

# If there's already a .git directory, we don't need to do anything
if git remote -v | grep -q "origin"; then
  echo "Origin already set"
  if git remote -v | grep -q $3; then
    echo "Origin matches project origin, doing nothing"
    exit 0
  else
    echo "Origin does not match project origin, removing"
    git remote rm origin
  fi
fi

echo "Setting new origin"

git fetch upstream
git merge upstream/master
git remote add origin $3
git add -A
git commit -m "Initial commit"
git push -u origin master
