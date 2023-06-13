#!/bin/bash

echo ""
echo "----------------------------"
echo "  PACK"
echo "----------------------------"
echo ""

REPO_ROOT="$(realpath $(dirname "$(realpath "${BASH_SOURCE:-$0}")")/../)/"

# save already set environment variables to restore later (quasi dotenv_config_override=false)
CURRENT_ENV=$(declare -p -x)

if [ -f "${REPO_ROOT}.env" ]; then
  set -a
  source "${REPO_ROOT}.env"
  set +a
fi

# restore previously saved environment variables
eval "$CURRENT_ENV"

if [ "$LEVEL" = "" ]; then
  LEVEL=1
fi

if [ -z "$OUTPUTDIR" ]; then
  OUTPUTDIR=$(pwd)/dist/
fi

echo ""
echo "packing contents of \"${OUTPUTDIR}\" into \"${PROJECT}.zip\""

cd $OUTPUTDIR
zip -qr $PROJECT.zip ./*
sha256sum $PROJECT.zip | cut -f 1 -d " " > $PROJECT.zip.hash
# going back to the previous directory (quasi "cd -" without the pwd part)
cd $OLDPWD

echo ""
echo "done"
