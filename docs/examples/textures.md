# Textures

## Using debug textures

```ts
import { Texture } from 'arx-level-generator'

const texture = Texture.missingTexture
```

This loads the jorge texture from thief's dromed:
![jorge texture](img/textures-jorge.jpg?raw=true 'jorge texture')

This is the default texture for entities and rooms unless a texture is defined

```ts
const texture = Texture.uvDebugTexture
```

This loads a debug texture for checking whether any faces are flipped
![uv debug texture](img/textures-uv-debug.jpg?raw=true 'uv debug texture')

## Loading a pre-defined texture from Arx

A few textures have been added from the game. Just start typing and you should be able to find a few usable.
The names of in-game textures have been changed from `UPPER_CASE` to `camelCase` and brackets have been removed:

```ts
// loads "L4_YLSIDE_[STONE]_GROUND01.jpg"
const texture = Texture.l4YlsideStoneGround01
```

![predefined texture](img/textures-predefined.jpg?raw=true 'predefined texture')

## Manually load a texture from Arx

By default the Texture class is trying to load the texture from the game. Casing doesn't matter, you can
write it in lower case letters as well, Arx Libertatis can handle it.

Note that arx-level-generator does not check whether the texture exists, it will merely hold a reference to it.

```ts
const texture = new Texture({
  filename: 'L3_CAVES_[STONE]_GROUND03.jpg',
})
```

![manually loaded texture](img/textures-manual-arx.jpg?raw=true 'manually loaded texture')

## Custom texture

Place a `.jpg`, `.jpeg`, `.png` or `.bmp` image into the `assets` folder and add a material in its filename
between square brackets. You can use the following materials:

- stone
- marble
- rock
- wood
- wet
- mud
- blood
- bone
- flesh
- shit <-- _yes, this is an [official Arx Fatalis material](https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/DANAE/ARX_NPC.cpp#L4151)_
- soil
- gravel
- earth
- dust
- sand
- straw
- metal
- iron
- glass
- rust
- ice
- fabric
- moss

### Non-square textures

If a texture does not have the same width and height then it cannot be tiled, but still can be stretched to fit a plane mesh for example:

I've created the `assets/textures/` folders and placed `hamster-[stone].jpg` into it.

```ts
const texture = new Texture({
  filename: 'hamster-[stone].jpg',
  isNative: false, // native textures are the ones coming from the original game
  width: 1280,
  height: 853,
  sourcePath: './textures/', // relative to the "assets" folder
})

const mesh = createPlaneMesh({
  size: new Vector2(200, 200),
  tileSize: 50,
  texture,
  tileUV: false, // stretch it, not tile it
})
```

![custom non-square texture](img/textures-custom-non-square.jpg?raw=true 'custom non-square texture')

### Square textures

Trying to tile a non-square texture can be done automatically by the arx-level-generator, it will crop off pixels
from the longer edge to match the shorter.

```ts
let texture = new Texture({
  filename: 'hamster-[stone].jpg',
  isNative: false,
  width: 1280,
  height: 853,
  sourcePath: './textures/',
})

texture = Material.fromTexture(texture, {
  flags: ArxPolygonFlags.Tiled, // <-- the texture needs to be marked as tileable
})

const mesh = createPlaneMesh({
  size: new Vector2(200, 200),
  tileSize: 50,
  texture,
  tileUV: true, // <-- this also needs to be set
})
```

If the `ArxPolygonFlags.Tiled` part is missing, then a non-square texture will not get resized and will result in
an incorrect tiling:
![texture tiling error](img/textures-tiled-error.jpg?raw=true 'texture tiling error')

If all goes well then the surface should look like this:
![texture tiling ok](img/textures-tiled-ok.jpg?raw=true 'texture tiling ok')

Textures which are already square shaped and have their width/height set to powers of 2 - like 64, 128, 256, 512, etc
then the texture can automatically be tiled without having to specify any extra flags via the Material class

```ts
const texture = new Texture({
  filename: 'hamster-[stone].jpg',
  isNative: false,
  size: 512, // <-- instead of having separate "width" and "height" options, size can be specified with this single "size" option
  sourcePath: './textures/',
})
```

**You cannot have the same image file loaded as tileable and non-tileable in 2 texture instances!**

## Supported formats

See ["notes on formats" section in readme](https://github.com/arx-tools/arx-level-generator?tab=readme-ov-file#notes-on-formats)

## Limitations

Note that tilable textures cannot be used on `EntityModels` as nor the Arx Fatalis nor the Arx Libertatis engine supports it.
There's a pull request being stuck that aims to remedy this, but it's yet to be merged: https://github.com/arx/ArxLibertatis/pull/294. This can be fixed by calling `normalizeUV(geometry)` which ensures all UV coordinates are between `0.0` and `1.0`.
(Can also be used for non-entity meshes)

## Resources

Source of the hamster texture: https://www.alamy.com/stock-photo-european-hamster-black-bellied-hamster-common-hamster-cricetus-cricetus-20491567.html
