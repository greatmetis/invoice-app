#!/usr/bin/env sh

set -e

# build
npm run build

# navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'New deployment'
git push -f https://github.com/greatmetis/invoice-app.git main:gh-pages

cd -