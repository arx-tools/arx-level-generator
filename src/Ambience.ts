type AmbienceConstructorProps = {
  src: string
  maxVolume: number
}

export class Ambience {
  src: string
  maxVolume: number

  constructor(props: AmbienceConstructorProps) {
    this.src = props.src
    this.maxVolume = props.maxVolume
  }
}
