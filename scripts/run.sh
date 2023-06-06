#!/bin/bash

echo ""
echo "----------------------------"
echo "  RUN"
echo "----------------------------"
echo ""

set -e

REPO_ROOT="$(realpath $(dirname "$(realpath "${BASH_SOURCE:-$0}")")/../)/"

if [ -f "${REPO_ROOT}.env" ]; then
  set -a
  source "${REPO_ROOT}.env"
  set +a
fi

if [ "$LEVEL" = "" ]; then
  LEVEL=1
fi

if [ -z "$OUTPUTDIR" ]; then
  OUTPUTDIR=$(pwd)/dist/
fi

# windows
if [ -e "${OUTPUTDIR}arx.exe" ]; then
  $OUTPUTDIR/arx.exe --loadlevel $LEVEL
fi

# linux
if [ -e "${OUTPUTDIR}arx" ]; then
  $OUTPUTDIR/arx --loadlevel $LEVEL
fi

set +e
