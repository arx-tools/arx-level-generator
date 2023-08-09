# Arx Fatalis level generator

A tool for creating maps for the video game [Arx Fatalis](https://en.wikipedia.org/wiki/Arx_Fatalis)

Required extra packages: [pkware-test-files](https://github.com/arx-tools/pkware-test-files)
as it contains all the arx fatalis levels readily unpacked. The level generator expects the levels to be
inside `../pkware-test-files` relative to where you have installed the `arx-level-generator` (the 2 packages
should be in the same folder next to each other)

The packages caches levels that are loaded from the original game into the `.cache` folder inside the repo that uses
the arx-level-generator. If you update any textures or update `arx-convert` and it changes the format of the json
structure, then just delete the `.cache` folder and you're good to go.

## notes on formats

make sure that all assets are lowercase

`jpg` files should be saved without progressive option (the level generator CAN handle this)

`bmp` files should only contain 3x8bit channels, alpha channel should be removed (24 bit, not 32 bit) and also check the
"do not write color space information" checkbox in compatibility options
(the level generator CAN'T handle this - https://github.com/shaozilee/bmp-js/issues/39)

audio should be Microsoft ADCPM `wav`

`asl` scripts should be exported with ISO 8859-15 encoding and `\r\n` line endings (the level generator CAN handle this)

## Notable dependencies

Fred's lighting calculator: https://github.com/fredlllll/ArxLibertatisLightingCalculator

Requires dotnet 6.0+ to be installed

## Other docs

[documentation of the custom 'rooms' format](docs/rooms.md)
