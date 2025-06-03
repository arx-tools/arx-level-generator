# Offsets

[back to main rooms readme](./01-readme.md)

## Table of contents

- [01 - rooms index page](./01-readme.md)
- [02 - example code showcasing every feature of the syntax](./02-example.md)
- [03 - explaining room alignments](./03-aligning-rooms.md)
- [04 - more fine grained alignments with offsets using phantom rooms](./04-offsets.md)
- [05 - explaining variables](./05-variables.md)

Sometimes aligning to the edges or the center of a room is not enough, a more precise offset is required.

Let's start with a room that we look down onto from the top:

![Initial room](../images/04-offsets-1.jpg?raw=true 'Initial room')

And let's also say that you want to add a doorway on the left side (`z++` and `y-` alignment):

![Crude doorway](../images/04-offsets-2.jpg?raw=true 'Crude doorway')

But doorways that are perfectly in line with the wall of a room looks out of place as doors need to have frames around
them that support the hinges and other stuff, so the ideal goal would be something like this:

![Ideal doorway](../images/04-offsets-3.jpg?raw=true 'Ideal doorway')

This can be achieved by adding a **phantom room** with 0 on one or more axis (so that polygons that are aligned will not get removed).

First you add a room like this - denoted with red - for example `room add 50 200 100 z++ x-`:

![Phantom room full](../images/04-offsets-4.jpg?raw=true 'Phantom room full')

Then you add the doorway you actually want with `x++ z++` alginment:

![Phantom room full + doorway](../images/04-offsets-5.jpg?raw=true 'Phantom room full + doorway')

Then you go back to the **phantom room** and collapse the z axis to be 0: `50 200 100` becomes `50 200 0` with the following result:

![Phantom room collapsed + doorway](../images/04-offsets-6.jpg?raw=true 'Phantom room collapsed + doorway')

And to finish things up mirror the same thing but on the other side of the doorway:

![Complete doorway](../images/04-offsets-7.jpg?raw=true 'Complete doorway')

The same technique is utilized in [LaLee's minigame](https://github.com/meszaros-lajos-gyorgy/arx-map-lalees-minigame) for the entrance to the pantry:

![Pantry entry](../images/04-offsets-8.jpg?raw=true 'Pantry entry')

**Note**: This will be more easily done with a new command in the future. The issue for implementing it can be seen [here](https://github.com/arx-tools/arx-level-generator/issues/27).
