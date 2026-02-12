#!/bin/bash

# Git Commands - Run locally

git init
git config user.name "sheikhcoders"
git config user.email "sheikhcoders@gmail.com"
git add .
git commit -m "Initial commit: Ant Design X Suite"
git branch -M main
git remote add origin https://github.com/sheikhcoders/ant-design-x-suite.git
git push -u origin main