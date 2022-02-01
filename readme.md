# Arx Fatalis level generator

Creates procedurally generated levels

**WORK IN PROGRESS**

![launcher](photos/launcher.png?raw=true "launcher")
![screenshot](photos/demo.png?raw=true "dummy map")
![screenshot](photos/statue.png?raw=true "statue npc")

## Requirements

nodejs 14.14.0+ (because of https://nodejs.org/api/fs.html#fspromisesrmpath-options)

## How to run

step 1: `npm run generate`

step 2: `npm run compile`

step 3: copy contents of dist folder into Arx Fatalis/Arx Libertatis game folder

## Resources

https://wiki.arx-libertatis.org/Script:Variables

## Credits for Assets

### Sirs (Sergey Vershinin)

`sfx/ambiance/loop_sirs.wav`

### Interval

`graph/obj3d/textures/skybox_01_*.jpg`

### Michel

`graph/obj3d/textures/npc_human_base_lali_head.bmp`

### NotHere

`misc/the-backrooms/ceiling-lamp.blend`

## notes on formats

make sure that all assets are lowercase

jpg files should not be saved with progressive option

bmp files should only contain 3x8bit channels, alpha channel should be removed (24 bit, not 32)

audio should be Microsoft ADCPM
