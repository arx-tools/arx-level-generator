#!/bin/bash

cd /c/Program\ Files/Arx\ Libertatis/game/graph/levels/level1

echo "FTS"

cat fast.fts.json | from-json --ext=fts > fast.fts.repacked
cat fast.fts.repacked | implode -b -l --offset=1816 --debug --output=fast.fts

cd ../../../../graph/levels/level1

echo "LLF"

cat level1.llf.json | from-json --ext=dlf > level1.llf.repacked
cat level1.llf.repacked | implode -b -l --offset=0 --debug --output=level1.llf

echo "DLF"

cat level1.dlf.json | from-json --ext=dlf > level1.dlf.repacked
cat level1.dlf.repacked | implode -b -l --offset=8520 --debug --output=level1.dlf

echo "done"
