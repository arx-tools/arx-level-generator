import { isOdd } from '@src/helpers.js'

export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const repeat = <T>(value: T, repetitions: number): T[] => {
  return Array(repetitions).fill(value)
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
  return numbers.reduce((total, n) => total + n, 0)
}

export const clone = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data))
}

export const any = <T>(fn: (value: T) => boolean, values: T[]) => {
  return values.some(fn)
}

export const none = <T>(fn: (value: T) => boolean, values: T[]) => {
  return !any(fn, values)
}

/**
 * @see https://stackoverflow.com/a/14438954/1806628
 */
export const uniq = <T>(values: T[]) => {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

export const last = <T>(values: T[]) => {
  if (values.length === 0) {
    return undefined
  }

  return values[values.length - 1]
}

/**
 * The average of all given values by summing values then divide by the amount of values
 *
 * mean([2, 2, 3, 5, 5, 7, 8]) === 4.57
 * because (2 + 2 + 3 + 5 + 5 + 7 + 8) / 7 === 4.57
 */
export const mean = (values: number[]) => {
  if (values.length === 0) {
    return 0
  }

  if (values.length === 1) {
    return values[0]
  }

  return sum(values) / values.length
}

/**
 * Finds the middle number of a list. If the list has an even number of elements,
 * then it takes the middle 2 and averages them.
 *
 * median([2, 2, 3, 5, 5, 7, 8]) === 5
 */
export const median = (values: number[]) => {
  if (values.length === 0) {
    return 0
  }

  if (values.length === 1) {
    return values[0]
  }

  const sortedValues = values.sort((a, b) => b - a)

  if (isOdd(values.length)) {
    return sortedValues[Math.floor(values.length / 2)]
  }

  const a = sortedValues[values.length / 2 - 1]
  const b = sortedValues[values.length / 2]

  return mean([a, b])
}

export const complement = (fn: (...args: any[]) => boolean) => {
  return (...args: any[]) => !fn(...args)
}

export const partition = <T>(fn: (arg: T) => boolean, values: T[]): [T[], T[]] => {
  return [values.filter(fn), values.filter(complement(fn))]
}

export const countBy = <T>(fn: (value: T) => string, values: T[]) => {
  return values.reduce((acc, value) => {
    const key = fn(value)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}
