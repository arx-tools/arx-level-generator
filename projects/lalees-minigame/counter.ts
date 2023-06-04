import { BoxGeometry, MathUtils, Mesh, MeshBasicMaterial } from 'three'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { GoblinVeryLightDoor } from '@prefabs/entity/Door.js'
import { Scale } from '@scripting/properties/Scale.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const createCounter = async ({ position }: { position: Vector3 }) => {
  const counterTopMaterial = new MeshBasicMaterial({
    map: await Texture.fromCustomFile({
      filename: '[stone]-granite.jpg',
      sourcePath: 'textures',
    }),
  })

  const counterMaterial = new MeshBasicMaterial({
    map: Texture.l4DwarfWoodBoard02,
  })

  const counterTopSize = new Vector3(140, 4, 100)

  let counterTopGeometry = new BoxGeometry(
    counterTopSize.x,
    counterTopSize.y,
    counterTopSize.z,
    Math.ceil(counterTopSize.x / 100),
    Math.ceil(counterTopSize.y / 100),
    Math.ceil(counterTopSize.z / 100),
  )
  counterTopGeometry = toArxCoordinateSystem(counterTopGeometry)

  const counterTop = new Mesh(counterTopGeometry, counterTopMaterial)
  counterTop.translateX(position.x)
  counterTop.translateY(position.y + counterTopSize.y / 2 + 15)
  counterTop.translateZ(position.z)
  counterTop.rotateY(MathUtils.degToRad(90))

  // let counterWallGeometry = new BoxGeometry(100, 10, 100, 1, 1, 1)
  // counterWallGeometry = toArxCoordinateSystem(counterWallGeometry)

  // const counterBackWall = new Mesh(counterWallGeometry, counterMaterial)
  // const counterLeftWall =
  // const counterRightWall =
  // const counterFloor =

  const leftDoor = new GoblinVeryLightDoor({
    position: position.clone().add(new Vector3(-40, 108, 70)),
  })
  leftDoor.script?.properties.push(new Scale(0.45))

  const rightDoor = new GoblinVeryLightDoor({
    position: position.clone().add(new Vector3(-40, 8, 70 - 140)),
    orientation: new Rotation(MathUtils.degToRad(180), 0, 0),
  })
  rightDoor.script?.properties.push(new Scale(0.45))

  return {
    entities: [leftDoor, rightDoor],
    meshes: [counterTop],
  }
}
