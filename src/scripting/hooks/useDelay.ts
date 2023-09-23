let delayIdx = 0

export const useDelay = () => {
  let delayOffset = 0

  /**
   * creates a timer with a unique identifier
   */
  const delay = (delayInMs: number = 0) => {
    delayOffset += Math.floor(delayInMs)

    return `TIMERdelay${++delayIdx} -m 1 ${delayOffset}`
  }

  /**
   * creates a timer without any identification
   * so the delay stays unique at runtime
   * and consequently being uncancellable with the off parameter
   */
  const uniqueDelay = (delayInMs: number = 0) => {
    delayOffset += Math.floor(delayInMs)

    return `TIMER -m 1 ${delayOffset}`
  }

  return { delay, uniqueDelay }
}
