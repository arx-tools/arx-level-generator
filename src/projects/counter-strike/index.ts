import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { getInjections } from '../../scripting'
import { RelativeCoords } from '../../types'
import { hideMinimap } from '../shared/reset'
import { ambiences } from '../../assets/ambiences'
import { generateBlankMapData, movePlayerTo, setColor, addZone, finalize, saveToDisk, setTexture } from '../../helpers'
import { createCsItaly } from './maps/cs_italy'
import { textures } from '../../assets/textures'
import { createChicken, defineChicken } from './chicken'

const createPlayerSpawn = (pos: RelativeCoords, config) => {
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

  moveTo(pos, [0, 0, 0], ref)
  markAsUsed(ref)

  return ref
}

const colors: Record<string, string> = {
  sky: '#b0d6f5',
  general: '#515151',
}

const generate = async (config) => {
  const { origin } = config

  const mapData = generateBlankMapData(config)
  mapData.meta.mapName = 'Counter Strike'

  movePlayerTo(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    mapData,
  )

  setColor(colors.sky, mapData)
  addZone(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    [100, 0, 100],
    'sky-color-setter',
    ambiences.none,
    5000,
  )(mapData)

  setColor(colors.general, mapData)

  createPlayerSpawn({ type: 'relative', coords: [-1000, 0, -(6000 - 2600)] }, config)

  await createCsItaly({ type: 'relative', coords: [700, 3200, 5000] }, 2.5, mapData)

  defineChicken()
  createChicken({ type: 'relative', coords: [1180, -300, 165] }, { a: 0, b: 0, g: 0 })

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
