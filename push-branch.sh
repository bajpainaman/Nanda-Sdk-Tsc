#\!/bin/bash

echo "This script will push your branch to the remote repository"
echo "Please enter your GitHub Personal Access Token when prompted"
echo ""

# Extract username and repo from remote URL
REMOTE_URL=$(git config --get remote.origin.url)
if [[ $REMOTE_URL == https://github.com/* ]]; then
  REPO_PATH=${REMOTE_URL#https://github.com/}
  REPO_PATH=${REPO_PATH%.git}
else
  echo "Remote URL is not a GitHub HTTPS URL"
  exit 1
fi

# Current branch
BRANCH=$(git branch --show-current)

# Execute the push with credential prompt
git push -u origin $BRANCH

echo "Push completed\!"
