import { isOdd } from '@src/helpers.js'

export function times<T>(fn: (index: number) => T, repetitions: number): T[] {
  return Array.from({ length: repetitions }).map((value, index) => {
    return fn(index)
  })
}

export function repeat<T>(value: T, repetitions: number): T[] {
  return Array.from({ length: repetitions }).map(() => {
    return value
  })
}

export function min(arr: number[]): number {
  let len = arr.length
  let min = Number.POSITIVE_INFINITY

  while (len--) {
    if (arr[len] < min) {
      min = arr[len]
    }
  }

  return min
}

export function max(arr: number[]): number {
  let len = arr.length
  let max = Number.NEGATIVE_INFINITY

  while (len--) {
    if (arr[len] > max) {
      max = arr[len]
    }
  }

  return max
}

export function sum(numbers: number[]): number {
  return numbers.reduce((total, n) => {
    return total + n
  }, 0)
}

/**
 * @see https://stackoverflow.com/a/14438954/1806628
 */
export function uniq<T>(values: T[]): T[] {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

/**
 * The average of all given values by summing values then divide by the amount of values
 *
 * ```
 * mean([2, 2, 3, 5, 5, 7, 8]) === 4.57
 * because (2 + 2 + 3 + 5 + 5 + 7 + 8) / 7 === 4.57
 * ```
 */
export function mean(values: number[]): number {
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
 * ```
 * median([2, 2, 3, 5, 5, 7, 8]) === 5
 * ```
 */
export function median(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  if (values.length === 1) {
    return values[0]
  }

  const sortedValues = values.sort((a, b) => {
    return b - a
  })

  if (isOdd(values.length)) {
    return sortedValues[Math.floor(values.length / 2)]
  }

  const a = sortedValues[values.length / 2 - 1]
  const b = sortedValues[values.length / 2]

  return mean([a, b])
}

export function complement(fn: (...args: any[]) => boolean): (...args: any[]) => boolean {
  return (...args: any[]) => {
    return !fn(...args)
  }
}

export function partition<T>(fn: (arg: T) => boolean, values: T[]): [T[], T[]] {
  return [values.filter(fn), values.filter(complement(fn))]
}

export function countBy<T>(fn: (value: T) => string, values: T[]): Record<string, number> {
  const acc: Record<string, number> = {}

  values.forEach((value) => {
    const key = fn(value)
    acc[key] = (acc[key] ?? 0) + 1
  })

  return acc
}

/**
 * Groups the values of a given array of numbers into infos about the sequences inside
 *
 * @input [1, 2, 3, 5, 6, 7, 10]
 * @output [[1, 3], [5, 3], [10, 1]]
 *
 * This function is similar to ramda's groupWith((a, b) => a + 1 === b, numbers)
 * but instead of having the result as `[[1, 2, 3], [5, 6, 7], [10]]`
 * the function gives back pairs of the first number and the size of each sequence
 *
 * The function does not perform any sorting on the numbers:
 * `[20, 19, 1, 2, 18, 3]` will become `[[19, 2], [1, 2], [18, 1], [3, 1]]`
 *
 * The first number in each pair holds the smallest number of the sequence
 * The second number is the size of the sequence
 */
export function groupSequences(numbers: number[]): [number, number][] {
  const acc: [number, number][] = []

  numbers.forEach((n) => {
    const lastGroup = acc.at(-1)

    if (lastGroup === undefined) {
      acc.push([n, 1])
      return
    }

    const [start, size] = lastGroup
    if (start - 1 === n || start + size === n) {
      lastGroup[0] = Math.min(n, start)
      lastGroup[1] = lastGroup[1] + 1
    } else {
      acc.push([n, 1])
    }
  })

  return acc
}
