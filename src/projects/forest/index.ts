import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { getInjections } from '../../scripting'
import { MapConfig, RelativeCoords } from '../../types'
import { hideMinimap } from '../shared/reset'
import { ambiences } from '../../assets/ambiences'
import { generateBlankMapData, movePlayerTo, setColor, addZone, finalize, saveToDisk } from '../../helpers'
import { createForestArea } from './areas/forest'
import { addTranslations } from '../../assets/i18n'
import translations from './i18n.json'
import { overridePlayerScript } from '../shared/player'
import { createGateArea } from './areas/gate'
import { createHub } from './areas/hub'

const createPlayerSpawn = (pos: RelativeCoords, config: MapConfig) => {
  const ref = createItem(items.marker)

  hideMinimap(config.levelIdx, ref)

  addScript((self) => {
    return `
// component: playerSpawn
ON INIT {
  ${getInjections('init', self)}
  SETCONTROLLEDZONE sky-color-setter
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  TELEPORT -p self
  ACCEPT
}
    `
  }, ref)

  moveTo(pos, { a: 0, b: 0, g: 0 }, ref)
  markAsUsed(ref)

  return ref
}

const generate = async (config: MapConfig) => {
  const { origin } = config

  const mapData = generateBlankMapData(config)
  mapData.meta.mapName = 'Forest'

  movePlayerTo(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    mapData,
  )

  setColor('#010101', mapData)
  addZone(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    [100, 0, 100],
    'sky-color-setter',
    ambiences.worm,
    5000,
  )(mapData)

  overridePlayerScript()
  createPlayerSpawn({ type: 'relative', coords: [0, 0, 0] }, config)

  await createForestArea(mapData)
  await createGateArea(mapData)
  await createHub(mapData)

  addTranslations(translations)

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
