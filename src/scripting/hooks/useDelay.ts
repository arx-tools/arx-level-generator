let delayIdx = 0

/**
 * Wrapper around the TIMERxxx concept.
 *
 * Note that 0ms delays are omitted, there will not be a script created for those.
 *
 * @see https://wiki.arx-libertatis.org/Script:timer
 */
class Timer {
  name: string
  delayOffsetInMs: number
  repetitions: number
  isCancelled: boolean

  constructor(delayOffsetInMs: number, repetitions: number, isUnique: boolean = false) {
    this.name = ''

    if (!isUnique) {
      delayIdx = delayIdx + 1
      this.name = `delay${delayIdx}`
    }

    this.delayOffsetInMs = delayOffsetInMs
    this.repetitions = repetitions
    this.isCancelled = false
  }

  toString(): string {
    if (this.isCancelled) {
      return `TIMER${this.name} off`
    }

    let { repetitions } = this
    if (this.repetitions === Number.POSITIVE_INFINITY) {
      repetitions = 0
    }

    // omit creating a timer for delay(0)
    if (repetitions === 1 && this.delayOffsetInMs === 0) {
      return ``
    }

    return `TIMER${this.name} -m ${repetitions} ${this.delayOffsetInMs}`
  }

  off(): void {
    this.isCancelled = true
  }
}

export function useDelay(): {
  /**
   * default value for repetitions is Number.POSITIVE_INFINITY
   */
  loop: (periodInMs: number, repetitions?: number) => Timer

  /**
   * creates a timer with a unique identifier (TIMERdelay16)
   * can be cancelled
   *
   * delay calls are stacked on top of previous values of delay() and uniqueDelay() calls:
   *
   * delay(100) ... -> executed 100 milliseconds after script start
   * delay(200) ... -> executed (100 + 200) milliseconds after script start
   *
   * this stacking behavior can be cancelled by giving false to the 2nd parameter;
   * giving false to the 2nd parameter will not reset previous stacking of delays
   */
  delay: (delayInMs?: number, stackOnPreviousDelay?: boolean) => Timer

  /**
   * creates a timer without any identifier (TIMER)
   * so the delay stays unique at runtime
   * and consequently being uncancellable with the off method
   *
   * uniqueDelay calls are stacked on top of previous values of delay() and uniqueDelay() calls:
   *
   * uniqueDelay(100) ... -> executed 100 milliseconds after script start
   * uniqueDelay(200) ... -> executed (100 + 200) milliseconds after script start
   *
   * this stacking behavior can be cancelled by giving false to the 2nd parameter;
   * giving false to the 2nd parameter will not reset previous stacking of delays
   */
  uniqueDelay: (delayInMs?: number, stackOnPreviousDelay?: boolean) => Timer
} {
  let delayOffset = 0

  function loop(periodInMs: number, repetitions: number = Number.POSITIVE_INFINITY): Timer {
    return new Timer(periodInMs, repetitions)
  }

  function delay(delayInMs: number = 0, stackOnPreviousDelay: boolean = true): Timer {
    if (stackOnPreviousDelay) {
      delayOffset = delayOffset + Math.floor(delayInMs)
      return new Timer(delayOffset, 1)
    }

    return new Timer(Math.floor(delayInMs), 1)
  }

  function uniqueDelay(delayInMs: number = 0, stackOnPreviousDelay: boolean = true): Timer {
    if (stackOnPreviousDelay) {
      delayOffset = delayOffset + Math.floor(delayInMs)
      return new Timer(delayOffset, 1, true)
    }

    return new Timer(Math.floor(delayInMs), 1, true)
  }

  return { loop, delay, uniqueDelay }
}
