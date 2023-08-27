# Arx Fatalis level generator

A tool for creating maps for the video game [Arx Fatalis](https://en.wikipedia.org/wiki/Arx_Fatalis)

## Dependencies

[Fred's lighting calculator](https://github.com/fredlllll/ArxLibertatisLightingCalculator)
requires dotnet 6.0+ to be installed

[pkware-test-files](https://github.com/arx-tools/pkware-test-files)
This package contains all the arx fatalis levels readily unpacked. The level generator tries to load the
files from the path specified in `Settings.originalLevelFiles` (default `../pkware-test-files`
relative to where you have installed the `arx-level-generator`)

## Notes on formats

make sure that all assets are lowercase

`jpg` - files should be saved without progressive option (the level generator CAN handle this)

`bmp` - files should only contain 3x8bit channels, alpha channel should be removed (24 bit, not
32 bit). When using GIMP make sure to check the "do not write color space information" checkbox in
compatibility options (the level generator CANNOT handle this - https://github.com/shaozilee/bmp-js/issues/39)

`wav` - all audio files should be Microsoft ADCPM

`asl` - scripts should be exported with ISO 8859-15 encoding and `\r\n` line endings (the level
generator CAN handle this)

## Variants

Since `1.4.0` the `Settings` class has a `variant` field with 2 values: `"normal"` and `"premium"`.

In normal mode:

- jpg textures will be exported with 70% quality as opposed to 100%
- all textures except the icons (ending in `[icon].bmp`) will be resized to half the original resolution

## Other docs

[documentation of the custom 'rooms' format](docs/rooms.md)
