#!/bin/bash

# Setup Git LFS for large JSON files
echo "Setting up Git LFS for ward JSON files..."

# Install Git LFS if not already installed
if ! command -v git-lfs &> /dev/null; then
    echo "Installing Git LFS..."
    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install git-lfs
    # For Ubuntu/Debian
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install git-lfs
    fi
fi

# Initialize Git LFS
git lfs install

# Track JSON files
git lfs track "public/map/ward_jsons/**/*.json"

# Add .gitattributes
git add .gitattributes

echo "Git LFS setup complete!"
echo "Now you can commit the ward JSON files:"
echo "git add public/map/ward_jsons/"
echo "git commit -m 'Add ward JSON files with Git LFS'"
