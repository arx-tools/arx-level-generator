let delayIdx = 0

/**
 * @see https://wiki.arx-libertatis.org/Script:timer
 */
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

  toString(): string {
    if (this.isCancelled) {
      return `TIMER${this.name} off`
    } else {
      return `TIMER${this.name} -m ${this.repetitions === Infinity ? 0 : this.repetitions} ${this.delayOffsetInMs}`
    }
  }

  off(): void {
    this.isCancelled = true
  }
}

export function useDelay() {
  let delayOffset = 0

  function loop(periodInMs: number, repetitions: number = Infinity): Timer {
    return new Timer(periodInMs, repetitions)
  }

  /**
   * creates a timer with a unique identifier (TIMERdelay16)
   * can be cancelled
   *
   * delay calls are stacked on top of previous values of delay() and uniqueDelay() calls:
   *
   * delay(100) ... -> executed 100 milliseconds after script start
   * delay(200) ... -> executed (100 + 200) milliseconds after script start
   */
  function delay(delayInMs: number = 0): Timer {
    delayOffset += Math.floor(delayInMs)
    return new Timer(delayOffset, 1)
  }

  /**
   * creates a timer without any identifier (TIMER)
   * so the delay stays unique at runtime
   * and consequently being uncancellable with the off method
   *
   * uniqueDelay calls are stacked on top of previous values of delay() and uniqueDelay() calls:
   *
   * uniqueDelay(100) ... -> executed 100 milliseconds after script start
   * uniqueDelay(200) ... -> executed (100 + 200) milliseconds after script start
   */
  function uniqueDelay(delayInMs: number = 0): Timer {
    delayOffset += Math.floor(delayInMs)
    return new Timer(delayOffset, 1, true)
  }

  return { loop, delay, uniqueDelay }
}
