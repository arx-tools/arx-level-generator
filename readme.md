# Arx Fatalis level generator

A node.js library for creating maps for the video game [Arx Fatalis](https://en.wikipedia.org/wiki/Arx_Fatalis)

## Dependencies

**three.js version 0.175.0**

The package uses a specific version of three.js and so it is marked as a peer dependency.
Always check the currently used version to avoid warnings and errors in your project

**arx-convert version 10.4.0**

Another peer dependency with data types and conversion tools for arx related formats.

### Optional dependencies

**pkware-test-files**

https://github.com/arx-tools/pkware-test-files

This package contains all the Arx Fatalis levels readily unpacked. The level generator tries to load the
files from the path specified in `Settings.originalLevelFiles` (default `../pkware-test-files`
relative to where you have installed the `arx-level-generator`) If you are not loading any levels via
`ArxMap.fromOriginalLevel()` then you don't need to install this dependency.

## Notes on formats

make sure that all assets are lowercase

`jpg` or `jpeg` - files should be saved without progressive option (the level generator CAN handle this)

`bmp` - files should only contain 3x8bit channels, alpha channel should be removed (24 bit, not
32 bit). When using GIMP make sure to check the "do not write color space information" checkbox in
compatibility options (the level generator CANNOT handle this - https://github.com/shaozilee/bmp-js/issues/39)

`png` - Arx Libertatis added support for png files, even supporting alpha channel

`wav` - all audio files should be `Microsoft ADCPM`

`asl` - scripts should be exported with `ISO 8859-15` encoding and `\r\n` line endings (the level
generator CAN handle this)

## Other documentation

- [the custom 'rooms' format](docs/rooms/01-readme.md)
- [code for the base project](docs/examples/base-project.md)
- [adding a three.js mesh to the level](docs/examples/adding-a-threejs-mesh.md)
- [working with textures](docs/examples/textures.md)

## Credits

- `assets/textures/uv-reference-map-[stone].jpg` (a.k.a. `Texture.uvDebugTexture`) - [https://www.artstation.com/blogs/zeeshannasir/peYz/reference-uv-map-grids](https://www.artstation.com/blogs/zeeshannasir/peYz/reference-uv-map-grids)
- `assets/textures/jorge-[stone].jpg` (a.k.a. `Texture.missingTexture`) - Thief 2 DromEd
