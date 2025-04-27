# Base Project

## node.js version

```ts
import { ArxMap } from 'arx-level-generator'
import { Platform, Settings } from 'arx-level-generator/platform/node'

// reads the contents of the .env file
// also: the presence of settings in method call arguments indicate file io happening inside (delayed as much as possible)
const settings = new Settings()

// create a blank map
const map = new ArxMap()

// set the origin of the map (default 0/0/0),
// polygons are placed relative to this point
// X and Z coordinates need to be within 0 and 16000
map.config.offset = new Vector3(6000, 0, 6000)

// the format used by arx-level-generator is a bit different
// to what arx is using, so a couple of conversions and checks
// are needed to be made before exporting the files
map.finalize(settings)

const platform = new Platform()
await platform.from(map).save(settings)
```

This will create a blank map with a single 100x100 tile below the player's feet.
As of version `21.0.0-alpha.8` of `arx-level-generator` this is the smallest
amount of code that can produce a working Arx Fatalis map.

![how the base project looks](img/base-project.jpg?raw=true 'how the base project looks')

## browser version - coming soon

```ts
import { ArxMap } from 'arx-level-generator'
import { Platform, Settings } from 'arx-level-generator/platform/browser'

// reads the contents of the .env file
// also: the presence of settings in method call arguments indicate file io happening inside (delayed as much as possible)
const settings = new Settings()

// create a blank map
const map = new ArxMap()

// set the origin of the map (default 0/0/0),
// polygons are placed relative to this point
// X and Z coordinates need to be within 0 and 16000
map.config.offset = new Vector3(6000, 0, 6000)

// the format used by arx-level-generator is a bit different
// to what arx is using, so a couple of conversions and checks
// are needed to be made before exporting the files
map.finalize(settings)

const platform = new Platform()
await platform.from(map).save(settings)
```
