# Arx Fatalis level generator

Generates maps for the video game Arx Fatalis and Arx Libertatis

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
