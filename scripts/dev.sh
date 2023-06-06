#!/bin/bash

REPO_ROOT="$(realpath $(dirname "$(realpath "${BASH_SOURCE:-$0}")")/../)/"

"${REPO_ROOT}scripts/generate.sh"

"${REPO_ROOT}scripts/compile.sh"

"${REPO_ROOT}scripts/run.sh"
