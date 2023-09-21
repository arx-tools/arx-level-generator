let delayIdx = 0

export const useDelay = () => {
  let delayOffset = 0

  return (delayInMs: number = 0) => {
    delayOffset += Math.floor(delayInMs)

    return `TIMERdelay${++delayIdx} -m 1 ${delayOffset}`
  }
}
