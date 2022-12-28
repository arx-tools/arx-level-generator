import { ArxFog } from 'arx-convert/types'
import { Color } from './Color'
import { Rotation } from './Rotation'
import { Vector3 } from './Vector3'

// TODO: Three JS also has a Fog class
// https://r105.threejsfundamentals.org/threejs/lessons/threejs-fog.html

type FogConstructorProps = {
  position: Vector3
  orientation: Rotation
  color: Color
  size: number
  special: number
  scale: number
  move: Vector3
  speed: number
  rotateSpeed: number
  toLive: number
  blend: number
  frequency: number
}

export class Fog {
  position: Vector3
  orientation: Rotation
  color: Color
  size: number
  special: number
  scale: number
  move: Vector3
  speed: number
  rotateSpeed: number
  toLive: number
  blend: number
  frequency: number

  constructor(props: FogConstructorProps) {
    this.position = props.position
    this.orientation = props.orientation
    this.color = props.color
    this.size = props.size
    this.special = props.special
    this.scale = props.scale
    this.move = props.move
    this.speed = props.speed
    this.rotateSpeed = props.rotateSpeed
    this.toLive = props.toLive
    this.blend = props.blend
    this.frequency = props.frequency
  }

  static fromArxFog(fog: ArxFog) {
    return new Fog({
      position: Vector3.fromArxVector3(fog.pos),
      orientation: Rotation.fromArxRotation(fog.angle),
      color: Color.fromArxColor(fog.color),
      size: fog.size,
      special: fog.special,
      scale: fog.scale,
      move: Vector3.fromArxVector3(fog.move),
      speed: fog.speed,
      rotateSpeed: fog.rotateSpeed,
      toLive: fog.toLive,
      blend: fog.blend,
      frequency: fog.frequency,
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
      move: this.move.toArxVector3(),
      speed: this.speed,
      rotateSpeed: this.rotateSpeed,
      toLive: this.toLive,
      blend: this.blend,
      frequency: this.frequency,
    }
  }
}
