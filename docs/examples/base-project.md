# Base Project

```ts
import { ArxMap, Settings } from 'arx-level-generator'

// reads the contents of the .env file
const settings = new Settings()

// create a blank map
const map = new ArxMap()

// the format used by arx-level-generator is a bit different
// to what arx is using, so a couple of conversions and checks
// are needed to be made before exporting the files
map.finalize(settings)

// export everything to a format which Arx can understand
await map.saveToDisk(settings)
```

This will create a blank map with a single 100x100 tile below the player's feet.
As of version `21.0.0-alpha.8` of `arx-level-generator` this is the smallest
amount of code that can produce a working Arx Fatalis map.

![how the base project looks](img/base-project.jpg?raw=true 'how the base project looks')
