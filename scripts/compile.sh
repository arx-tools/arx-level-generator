#!/bin/bash

echo ""
echo "----------------------------"
echo "  COMPILE"
echo "----------------------------"
echo ""

set -e

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

echo "output directory: $OUTPUTDIR"
echo ""

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
  echo ""
  echo "Fredlllll's lighting calculation"

  # DistanceAngle | DistanceAngleShadow | DistanceAngleShadowNoTransparency
  LIGHTING_MODE="DistanceAngleShadowNoTransparency"

  ${REPO_ROOT}lib/fredlllll-lighting-calculator/linux/ArxLibertatisLightingCalculator --level "level${LEVEL}" --arx-data-dir "$OUTPUTDIR" --lighting-profile "$LIGHTING_MODE"
fi

set +e

echo ""
echo "done"
