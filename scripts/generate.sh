#!/bin/bash

REPO_ROOT="$(realpath $(dirname "$(realpath "${BASH_SOURCE:-$0}")")/../)/"

tsc
tsc-alias
node --require dotenv/config --enable-source-maps "${REPO_ROOT}build/projects/index.js
