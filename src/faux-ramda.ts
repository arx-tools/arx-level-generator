export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const min = (arr: number[]) => {
  let len = arr.length
  let min = Infinity

  while (len--) {
    min = arr[len] < min ? arr[len] : min
  }

  return min
}

export const max = (arr: number[]) => {
  let len = arr.length
  let max = -Infinity

  while (len--) {
    max = arr[len] > max ? arr[len] : max
  }

  return max
}

export const sum = (numbers: number[]) => {
  return numbers.reduce((sum, n) => sum + n, 0)
}

export const clone = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data))
}
