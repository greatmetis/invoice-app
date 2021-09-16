#!/usr/bin/env sh

set -e

npm run build

cd dist

git init 
git -A
git commit -m 'New Deloyment'
git push -f https://github.com/greatmetis/invoice-app.git main gh-pages

cd -