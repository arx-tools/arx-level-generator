# Aligning Rooms

[back to main rooms readme](./01-readme.md)

## Table of contents

- [01 - rooms index page](./01-readme.md)
- [02 - example code showcasing every feature of the syntax](./02-example.md)
- [03 - explaining room alignments](./03-aligning-rooms.md)
- [04 - more fine grained alignments with offsets using phantom rooms](./04-offsets.md)
- [05 - explaining variables](./05-variables.md)

Rooms are cubical shapes which you can align to one another on 3 axis:

- x is the horizontal axis going from left to right
- y is the vertical axis going from down to up
- z is the depth axis going from back to front

Every axis has 5 alignments going from the negative end to the positive: `--`, `-`, `<empty>`, `+` and `++`

Let's look at the alignments on the `x` axis as an example:

## x<empty>

`x` without any `-` or `+` signs means central alignment, the room you are adding will be horizontally in the center compared to the previous room:

```sh
room add 400 400 400    # this is room "A" the starting room
room add 200 200 200 x  # this is room "B"
```

The center of room "B" - on the x axis - will be at the point where the center of room "A" is, they are aligned to the point denoted with the asterisk symbol:

```
     |___B___|
 ________*________
|        A        |
```

If room "B" is wider than room "A", then it looks like this:

```
|___________B___________|
    ________*________
   |        A        |
```

## x- and x+

Adding a single `-` or `+` sign after an axis will move room "B" to the left or the right end of the dimensions of room "A" while making sure room "B" starts or ends within the edges of room "A".

### `x-` looks like:

```
|___B___|
*_________________
|        A        |
```

or if room "B" is wider, then:

```
|___________B___________|
*_________________
|        A        |
```

### `x+` looks like:

```
          |___B___|
 _________________*
|        A        |
```

or if room "B" is wider, then:

```
|___________B___________|
       _________________*
      |        A        |
```

## x-- and x++

Similar to `x-` and `x+`, but room "B" is aligned outside the edges of room "A", meaning the other edge of room "B" gets aliged to room "A":

### `x--` looks like:

```
|___B___|
        *_________________
        |        A        |
```

or if room "B" is wider, then:

```
|___________B___________|
                        *_________________
                        |        A        |
```

### `x++` looks like:

```
                  |___B___|
 _________________*
|        A        |
```

or if room "B" is wider, then:

```
                  |___________B___________|
 _________________*
|        A        |
```

## Default alignments

A room by default is aligned to the previous room with `x y- z` meaning it's centrally aligned on both the `x` and `z`
axis, but its floor meets the previous room's floor. Any or all of these default values can be omitted from a room
definition, so writing only `room add 400 250 400` is the same as writing `room add 400 250 400 x y- z`.

## Order of axis

The order of axis when writing a room definition doesn't matter, they can be mixed up however you like. Writing `z++ x-`
is the same as writing `x- z++`.

## Similarities to CSS on the web

This alignment model was inspired by the [`justify-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) CSS property of [`flexbox`](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) layouts.

- `x<empty>` is the same as `justify-content: center;` on the x axis
- `x-` is the same as `justify-content: flex-start;` on the x axis
- `x+` is the same as `justify-content: flex-end;` on the x axis
- `x--` has no corresponding css equivalent
- `x++` has no corresponding css equivalent
