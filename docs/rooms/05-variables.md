# Variables

[back to main rooms readme](./01-readme.md)

## Table of contents

- [01 - rooms index page](./01-readme.md)
- [02 - example code showcasing every feature of the syntax](./02-example.md)
- [03 - explaining room alignments](./03-aligning-rooms.md)
- [04 - more fine grained alignments with offsets using phantom rooms](./04-offsets.md)
- [05 - explaining variables](./05-variables.md)
- [06 - branching with "cursor save/restore"](./06-branching.md)

Let's say you have 3 rooms connected by 2 corridors:

```sh
room add 400 400 400
room add 200 250 600 z++
room add 400 400 500 z++
room add 600 250 200 x++
room add 400 400 400 x++
```

Let's also assume that you haven't fully settled on the height of the corridors and you want to see how everything looks if you increase their heights from 250 to 300.
You can do this by hand or you can use a variable for this (or more like a constant as you can't change its value over time):

```sh
$roomHeight = 400
$corridorHeight = 250

room add 400 $roomHeight 400
room add 200 $corridorHeight 600 z++
room add 400 $roomHeight 500 z++
room add 600 $corridorHeight 200 x++
room add 400 $roomHeight 400 x++
```

Now there's only one place where you have to make modifications to the height which will be replicated for all rooms.

You can have as many variables as you want for any coordinates.

Variables are also very useful for giving context and meaning to numbers. 250 on its own doesn't really tell about whether there's any connection between other instances of 250 among room dimensions, but "corridor height" perfectly illustrates it.
