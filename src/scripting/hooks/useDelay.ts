let delayIdx = 0

class Timer {
  name: string = ''
  delayOffsetInMs: number
  /**
   * Infinity or positive integer
   */
  repetitions: number
  isCancelled: boolean

  constructor(delayOffsetInMs: number, repetitions: number, isUnique: boolean = false) {
    if (!isUnique) {
      this.name = `delay${++delayIdx}`
    }

    this.delayOffsetInMs = delayOffsetInMs
    this.repetitions = repetitions
    this.isCancelled = false
  }

  toString() {
    if (this.isCancelled) {
      return `TIMER${this.name} off`
    } else {
      return `TIMER${this.name} -m ${this.repetitions === Infinity ? 0 : this.repetitions} ${this.delayOffsetInMs}`
    }
  }

  off() {
    this.isCancelled = true
  }
}

export const useDelay = () => {
  let delayOffset = 0

  const loop = (periodInMs: number, repetitions: number = Infinity) => {
    return new Timer(periodInMs, repetitions)
  }

  /**
   * creates a timer with a unique identifier (TIMERdelay16)
   * can be cancelled
   */
  const delay = (delayInMs: number = 0) => {
    delayOffset += Math.floor(delayInMs)
    return new Timer(delayOffset, 1)
  }

  /**
   * creates a timer without any identifier (TIMER)
   * so the delay stays unique at runtime
   * and consequently being uncancellable with the off method
   */
  const uniqueDelay = (delayInMs: number = 0) => {
    delayOffset += Math.floor(delayInMs)
    return new Timer(delayOffset, 1, true)
  }

  return { loop, delay, uniqueDelay }
}
