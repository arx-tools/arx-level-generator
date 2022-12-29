type AmbienceConstructorProps = {
  src: string
  maxVolume: number
  reverb: number
}

export class Ambience {
  src: string
  maxVolume: number
  reverb: number

  constructor(props: AmbienceConstructorProps) {
    this.src = props.src
    this.maxVolume = props.maxVolume
    this.reverb = props.reverb
  }
}
