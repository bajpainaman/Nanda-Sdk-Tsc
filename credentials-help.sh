#\!/bin/bash
# Configure git to save credentials (macOS keychain)
git config credential.helper osxkeychain

# Instructions for manual authentication
echo "Run: git push -u origin feat/nanda-integration"
echo "When prompted, enter your GitHub username and PAT"
