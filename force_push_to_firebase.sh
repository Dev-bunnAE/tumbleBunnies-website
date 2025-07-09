#!/bin/bash

# This script performs a force push of the current local branch to the remote branch named 'Firebase' on the 'origin' remote.
#
# WARNING: Force pushing overwrites the history of the remote branch.
# Any changes on the remote branch that are not in your local branch will be lost.
# Use this script with extreme caution, especially if you are collaborating with others.
# It can lead to significant data loss and make collaboration difficult.

read -p "Are you absolutely sure you want to force push the current branch to the 'Firebase' branch on 'origin'? This will overwrite the remote branch history and can cause data loss for collaborators. (type 'yes' to confirm): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Force push cancelled by user."
    exit 0
fi

echo "Proceeding with force push..."
# Perform the force push. HEAD refers to the current branch.
git push origin HEAD:Firebase --force

# Check the exit status of the git push command
if [ $? -eq 0 ]; then
    echo "Force push to origin/Firebase completed successfully."
else
    echo "Error during force push."
fi