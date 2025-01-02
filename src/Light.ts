import { type ArxLight, ArxLightFlags } from 'arx-convert/types'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'
import { type IArxComponent } from '@src/IArxComponent.js'
import { type Box3 } from 'three'

// TODO: Three JS comes with a bunch of Light classes, might worth investigating
// https://threejs.org/docs/#api/en/lights/Light

type LightConstructorProps = {
  position: Vector3
  color?: Color
  flags?: ArxLightFlags
  fallStart?: number
  fallEnd?: number
  intensity?: number
  lightData: Omit<ArxLight, 'pos' | 'color' | 'flags' | 'fallStart' | 'fallEnd' | 'intensity'>
}

export class Light implements IArxComponent {
  static fromArxLight({ pos, color, flags, fallStart, fallEnd, intensity, ...lightData }: ArxLight): Light {
    return new Light({
      position: Vector3.fromArxVector3(pos),
      color: Color.fromArxColor(color),
      flags,
      fallStart,
      fallEnd,
      intensity,
      lightData,
    })
  }

  position: Vector3
  color: Color
  flags: ArxLightFlags
  fallStart: number
  fallEnd: number
  intensity: number
  lightData: Omit<ArxLight, 'pos' | 'color' | 'flags' | 'fallStart' | 'fallEnd' | 'intensity'>

  constructor(props: LightConstructorProps) {
    this.position = props.position
    this.color = props.color ?? Color.white
    this.flags = props.flags ?? ArxLightFlags.None
    this.fallStart = props.fallStart ?? 0
    this.fallEnd = props.fallEnd ?? 100
    this.intensity = props.intensity ?? 1
    this.lightData = props.lightData
  }

  clone(): Light {
    return new Light({
      position: this.position.clone(),
      color: this.color.clone(),
      flags: this.flags,
      fallStart: this.fallStart,
      fallEnd: this.fallEnd,
      intensity: this.intensity,
      lightData: structuredClone(this.lightData),
    })
  }

  toArxData(): ArxLight {
    return {
      ...this.lightData,
      pos: this.position.toArxData(),
      color: this.color.toArxData(),
      flags: this.flags,
      fallStart: this.fallStart,
      fallEnd: this.fallEnd,
      intensity: this.intensity,
    }
  }

  move(offset: Vector3): void {
    this.position.add(offset)
  }

  /**
   * The center of the light is inside or on the surface of the box.
   *
   * If exludeOnSurface (default true) is true, then we ignore checking the surface by shrinking
   * the box by 1 on each side
   */
  isWithin(box: Box3, excludeOnSurface: boolean = true): boolean {
    const copyOfBox = box.clone()
    if (excludeOnSurface) {
      copyOfBox.min.add(new Vector3(1, 1, 1))
      copyOfBox.max.sub(new Vector3(1, 1, 1))
    }

    return copyOfBox.containsPoint(this.position)
  }
}
