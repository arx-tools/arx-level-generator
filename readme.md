# Arx Fatalis level generator

A tool for creating maps for the video game [Arx Fatalis](https://en.wikipedia.org/wiki/Arx_Fatalis)

## Dependencies

[pkware-test-files](https://github.com/arx-tools/pkware-test-files)
This package contains all the Arx Fatalis levels readily unpacked. The level generator tries to load the
files from the path specified in `Settings.originalLevelFiles` (default `../pkware-test-files`
relative to where you have installed the `arx-level-generator`) If you are not loading any levels via
`ArxMap.fromOriginalLevel()` then you don't need to install this dependency.

**three.js version 0.167.0**

The package uses a specific version of three.js and so it is marked as a peer dependency.
Always check the currently used version to avoid warnings and errors in your project

**arx-convert version 10.0.1**

Another peer dependency with data types and conversion tools for arx related formats.

## Notes on formats

make sure that all assets are lowercase

`jpg` - files should be saved without progressive option (the level generator CAN handle this)

`bmp` - files should only contain 3x8bit channels, alpha channel should be removed (24 bit, not
32 bit). When using GIMP make sure to check the "do not write color space information" checkbox in
compatibility options (the level generator CANNOT handle this - https://github.com/shaozilee/bmp-js/issues/39)

`png` - Arx Libertatis added support for png files, even supporting alpha channel

`wav` - all audio files should be `Microsoft ADCPM`

`asl` - scripts should be exported with `ISO 8859-15` encoding and `\r\n` line endings (the level
generator CAN handle this)

## Other docs

[documentation of the custom 'rooms' format](docs/rooms.md)

## Credits

- `assets/textures/uv-reference-map-[stone].jpg` (a.k.a. `Texture.uvDebugTexture`) - [https://www.artstation.com/blogs/zeeshannasir/peYz/reference-uv-map-grids](https://www.artstation.com/blogs/zeeshannasir/peYz/reference-uv-map-grids)
- `assets/textures/jorge-[stone].jpg` (a.k.a. `Texture.missingTexture`) - Thief 2 DromEd

## Extra caveats to keep in mind and try to find a workaround later

Quote from Pedro Ordaz:

> When testing 3D, I encountered a strange issue: after some investigation I discovered something quite interesting,
> entities won't react to angular lighting/flat shading if they use an uncompressed FTL mesh. This is for both
> fix_inter and typical movable entities, as a result, eli2's arx_addon only works with smooth shading.
>
> Another interesting discovery is when an entity with flat shading triggers an animation, its shader automatically
> switches from flat to smooth in-game
>
> I supose is that some property is broken when exporting uncompressed models, vanilla models work with both flat
> and smooth shadings, but models from blender only support smooth shading, if you enable angular via scripts,
> the entity will be totally dark and not reacting with any light source. What only the game does internally is
> to change the shading when an entity is playing an animation

_probably related to the arx libertatis blender plugin_
