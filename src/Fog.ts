import { type ArxFog } from 'arx-convert/types'
import { type ArxComponent } from '@src/ArxComponent.js'
import { Color } from '@src/Color.js'
import { Rotation } from '@src/Rotation.js'
import { Vector3 } from '@src/Vector3.js'

// TODO: Three JS also has a Fog class
// https://r105.threejsfundamentals.org/threejs/lessons/threejs-fog.html

type FogConstructorProps = {
  position: Vector3
  orientation: Rotation
  color: Color
  size: number
  special: number
  scale: number
  movement: Vector3
  speed: number
  rotateSpeed: number
  toLive: number
  frequency: number
}

export class Fog implements ArxComponent {
  static fromArxFog(fog: ArxFog): Fog {
    return new Fog({
      position: Vector3.fromArxVector3(fog.pos),
      orientation: Rotation.fromArxRotation(fog.angle),
      color: Color.fromArxColor(fog.color),
      size: fog.size,
      special: fog.special,
      scale: fog.scale,
      movement: Vector3.fromArxVector3(fog.move),
      speed: fog.speed,
      rotateSpeed: fog.rotateSpeed,
      toLive: fog.toLive,
      frequency: fog.frequency,
    })
  }

  position: Vector3
  orientation: Rotation
  color: Color
  size: number
  special: number
  scale: number
  movement: Vector3
  speed: number
  rotateSpeed: number
  toLive: number
  frequency: number

  constructor(props: FogConstructorProps) {
    this.position = props.position
    this.orientation = props.orientation
    this.color = props.color
    this.size = props.size
    this.special = props.special
    this.scale = props.scale
    this.movement = props.movement
    this.speed = props.speed
    this.rotateSpeed = props.rotateSpeed
    this.toLive = props.toLive
    this.frequency = props.frequency
  }

  clone(): Fog {
    return new Fog({
      position: this.position.clone(),
      orientation: this.orientation.clone(),
      color: this.color.clone(),
      size: this.size,
      special: this.special,
      scale: this.scale,
      movement: this.movement.clone(),
      speed: this.speed,
      rotateSpeed: this.rotateSpeed,
      toLive: this.toLive,
      frequency: this.frequency,
    })
  }

  toArxFog(): ArxFog {
    return {
      pos: this.position.toArxVector3(),
      angle: this.orientation.toArxRotation(),
      color: this.color.toArxColor(),
      size: this.size,
      special: this.special,
      scale: this.scale,
      move: this.movement.toArxVector3(),
      speed: this.speed,
      rotateSpeed: this.rotateSpeed,
      toLive: this.toLive,
      frequency: this.frequency,
    }
  }

  move(offset: Vector3): void {
    this.position.add(offset)
  }
}
