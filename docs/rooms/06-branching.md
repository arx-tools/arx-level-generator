# Branching with "cursor save/restore"

[back to main rooms readme](./01-readme.md)

## Table of contents

- [01 - rooms index page](./01-readme.md)
- [02 - example code showcasing every feature of the syntax](./02-example.md)
- [03 - explaining room alignments](./03-aligning-rooms.md)
- [04 - more fine grained alignments with offsets using phantom rooms](./04-offsets.md)
- [05 - explaining variables](./05-variables.md)
- [06 - branching with "cursor save/restore"](./06-branching.md)

The level generator stores the center position of the last added room internally which is used to calculate
the relative position of any new rooms that are to be added. This feature is called a `cursor`.

Cursors can be used as checkpoints: you can save your current position and restore it later as many times as you like
and continue adding new rooms from that point, allowing you to do branching in the otherwise linear rooms definition.

A cursor point can be saved with `cursor save <name>` and restored with `cursor restore <name>`. A name can be any text
without space in it. You can save as many cursors as you like.

Let's do a simple `T` shape from 4 rooms and 3 corridors:

```sh
room add 400 300 400      # starting room
room add 200 250 600 z++  # corridor going north
room add 400 300 400 z++  # top center room

cursor save top-center    # saving the current position as "top-center"

room add 600 250 200 x--  # going west with another corridor
room add 400 300 400 x--  # going more to the west with a room

cursor restore top-center # going back to the top center

room add 600 250 200 x++  # going east
room add 400 300 400 x++

# bonus: adding a smaller corridor and room north of the T shape to get a cross †

cursor restore top-center # going back to the top center again

room add 200 250 300 z++  # going north
room add 400 300 400 z++
```

Please note that if you call `cursor restore` and you didn't save your previous position beforehand then that point
will be inaccessible afterwards! If you need to go back to that point later, then just call `cursor save` before
`cursor restore`.
