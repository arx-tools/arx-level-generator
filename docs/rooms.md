# "Rooms" custom format

[back to the main readme](../readme.md)

## Example rooms file

`assets/example/example.rooms`

```sh
# use shellscript for syntax highlighting

# This is a comment

# define textures for a room's faces
# possible faces:
#   ceiling
#   floor
#   wall - this will set all 4 walls at the same time
#   wall-east
#   wall-west
#   wall-north
#   wall-south
# face definitions are evaluated from top to bottom, so you can define "wall" and override a single side by
# setting "wall-south" after it
define room-no-ceiling {
  ceiling arx alpha.bmp # transparent texture from arx' builtin textures
  wall arx aliciaroom_mur02.jpg
  wall-north off # don't render any walls on this side
  floor custom textures [fabric]-carpet.jpg # custom texture from assets/textures/
  # optionally you can add fit-x, fit-y or stretch after the texture names to replace the original tiled texture fitting
}

$roomHeight = 300 # variable (or more like constant)

# the first room: 500 cm wide, 300 cm high, 500 cm deep
room add 500 $roomHeight 500 room-no-ceiling
with light # optional - use this to illuminate the last defined room
cursor save main-room # save the current position as "main-room" and restore it later - used for branching

# extrusion directions:
#   x++ east
#   x-- west
#   z++ north
#   z-- south
#   y-- down
#   y++ up

# add a doorway and another room towards north

room add 200 200 200 default y- z++ # add another room with the default "jorge" texture - bottoms aligned, room is extruded north
room add 400 $roomHeight 400 default y- z++ # another room extruded north
with light # optional third argument: percentage like 70% or "dim" = 50%. No 3rd argument means 100% full brightness
cursor save north-room # save as many cursor points as you want

# go back to the main room and extrude south

cursor restore main-room
room add 200 200 200 default y- z-- # another doorway, but this time south
room add 400 $roomHeight 1000 default y- z-- # a long corridor towards the south
with light
```

`projects/example/index.ts`

```ts
import { ArxMap } from '@src/ArxMap.js'
import { loadRooms } from '@prefabs/rooms/loadRooms.js'

export default async () => {
  const map = new ArxMap()

  // ...

  const rooms = await loadRooms('projects/example/example.rooms')
  rooms.forEach((room) => {
    map.add(room, true)
  })

  // ...
}
```
