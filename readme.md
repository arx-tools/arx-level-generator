# Arx Fatalis level generator

Generates maps for the video game Arx Fatalis and Arx Libertatis

Required extra packages: [pkware-test-files](https://github.com/meszaros-lajos-gyorgy/pkware-test-files)
as it contains all the arx fatalis levels readily unpacked. The level generator expects the levels to be
inside `../pkware-test-files` relative to where you have installed the `arx-level-generator` (the 2 packages
should be in the same folder next to each other)

## Known issues with the stack so far

https://github.com/evanw/esbuild/issues/1975

## notes on formats

make sure that all assets are lowercase

jpg files should be saved without progressive option

bmp files should only contain 3x8bit channels, alpha channel should be removed (24 bit, not 32)

audio should be Microsoft ADCPM wav

## Notable dependencies

Fred's lighting calculator: https://github.com/fredlllll/ArxLibertatisLightingCalculator

Requires dotnet framework 6.0 to be installed
