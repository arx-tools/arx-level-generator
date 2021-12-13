#!/bin/bash

LEVEL=1

cd ./dist/game/graph/levels/level$LEVEL

echo "FTS"

cat fast.fts.json | from-json --ext=fts | implode -b -l --offset=280 --debug --output=fast.fts

cd ../../../../graph/levels/level$LEVEL

echo "LLF"

cat level$LEVEL.llf.json | from-json --ext=dlf | implode -b -l --offset=0 --debug --output=level$LEVEL.llf

echo "DLF"

cat level$LEVEL.dlf.json | from-json --ext=dlf | implode -b -l --offset=8520 --debug --output=level$LEVEL.dlf

echo "done"

tput bel
