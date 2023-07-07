#!/bin/bash

echo ""
echo "----------------------------"
echo "  GENERATE"
echo "----------------------------"
echo ""

REPO_ROOT="$(realpath $(dirname "$(realpath "${BASH_SOURCE:-$0}")")/../)/"

${REPO_ROOT}node_modules/.bin/tsc
${REPO_ROOT}node_modules/.bin/tsc-alias
# node --require dotenv/config --enable-source-maps "${REPO_ROOT}build/projects/index.js"

echo ""
echo "done"
