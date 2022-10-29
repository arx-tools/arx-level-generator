#!/bin/bash

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

cd "${OUTPUTDIR}game/graph/levels/level$LEVEL"

echo "FTS"

cat fast.fts.json | arx-convert --from=json --to=fts | implode -b -l --offset=280 --debug --output=fast.fts

cd "${OUTPUTDIR}graph/levels/level$LEVEL"

echo "LLF"

cat level$LEVEL.llf.json | arx-convert --from=json --to=llf | implode -b -l --offset=0 --debug --output=level$LEVEL.llf

echo "DLF"

cat level$LEVEL.dlf.json | arx-convert --from=json --to=dlf | implode -b -l --offset=8520 --debug --output=level$LEVEL.dlf

# echo "Fred's lighting calculation"

# ${REPO_ROOT}lib/fredlllll-lighting-calculator/linux/ArxLibertatisLightingCalculator --level "level${LEVEL}" --arx-data-dir $OUTPUTDIR --lighting-profile DistanceAngle

echo "done"

tput bel
