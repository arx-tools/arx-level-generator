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

arx-convert --version

implode --version

echo ""

cd "${OUTPUTDIR}game/graph/levels/level$LEVEL"

echo ""
echo "compiling FTS"

cat fast.fts.json | arx-convert --from=json --to=fts > fast.fts.repacked
cat fast.fts.repacked | implode -b -l --offset=$(arx-header-size fast.fts.repacked --format=fts) --output=fast.fts --verbose
rm fast.fts.repacked

cd "${OUTPUTDIR}graph/levels/level$LEVEL"

echo ""
echo "compiling LLF"

cat level$LEVEL.llf.json | arx-convert --from=json --to=llf | implode -b -l --offset=0 --output=level$LEVEL.llf --verbose

echo ""
echo "compiling DLF"

cat level$LEVEL.dlf.json | arx-convert --from=json --to=dlf > level$LEVEL.dlf.repacked
cat level$LEVEL.dlf.repacked | implode -b -l --offset=$(arx-header-size level$LEVEL.dlf.repacked --format=dlf) --output=level$LEVEL.dlf --verbose
rm level$LEVEL.dlf.repacked

if [ "$CALCULATE_LIGHTING" == "1" ]; then
  echo "Fredlllll's lighting calculation"

  ${REPO_ROOT}lib/fredlllll-lighting-calculator/linux/ArxLibertatisLightingCalculator --level "level${LEVEL}" --arx-data-dir $OUTPUTDIR --lighting-profile DistanceAngle
fi

echo ""
echo "done"
