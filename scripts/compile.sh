#!/bin/bash

cd ./dist/game/graph/levels/level1

echo "FTS"

cat fast.fts.json | from-json --ext=fts | implode -b -l --offset=280 --debug --output=fast.fts

cd ../../../../graph/levels/level1

echo "LLF"

cat level1.llf.json | from-json --ext=dlf | implode -b -l --offset=0 --debug --output=level1.llf

echo "DLF"

cat level1.dlf.json | from-json --ext=dlf | implode -b -l --offset=8520 --debug --output=level1.dlf

echo "done"

tput bel
