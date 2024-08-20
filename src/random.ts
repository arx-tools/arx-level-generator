import { repeat, sum } from '@src/faux-ramda.js'

/**
 * creates a random floating point number between a (inclusive) and b (exclusive)
 */
export function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a)
}

/**
 * creates a random integer between min and max (both inclusive)
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
 */
export function randomIntBetween(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function pickRandoms<T>(n: number, set: T[]): T[] {
  if (set.length <= n) {
    return set
  }

  const matches: T[] = []

  const remaining = [...set]
  for (let i = 0; i < n; i++) {
    const idx = randomIntBetween(0, remaining.length - 1)
    matches.push(remaining.splice(idx, 1)[0])
  }

  return matches
}

export function pickRandom<T>(set: T[]): T {
  return pickRandoms(1, set)[0]
}

export function pickRandomIdx<T>(set: T[]): number {
  return pickRandom([...set.keys()])
}

export function randomSort<T>(items: T[]): T[] {
  const copyOfItems = [...items]
  const sortedItems: T[] = []

  while (copyOfItems.length > 0) {
    const idx = pickRandomIdx(copyOfItems)
    sortedItems.push(copyOfItems.splice(idx, 1)[0])
  }

  return sortedItems
}

/**
 * const values = pickWeightedRandoms(10, [
 *   { value: -6, weight: 10 },
 *   { value: 0, weight: 100 },
 *   { value: 6, weight: 10 },
 * ])
 *
 * values === [
 *  { value: 0, weight: 100 },
 *  { value: -6, weight: 10 },
 *  { value: 0, weight: 100 },
 *  { value: 0, weight: 100 },
 *  { value: 0, weight: 100 },
 *  { value: 6, weight: 10 },
 *  { value: 0, weight: 100 },
 *  { value: 0, weight: 100 },
 *  { value: 0, weight: 100 },
 *  { value: 0, weight: 100 }
 * ]
 *
 * guaranteePresenceOfAll=true will sort items with smaller weights to the beginning of the weightedSet
 * so they will always be present in the list of items, no matter how heavy other items are
 * this way the item with weight=1 will be guaranteed to show up in the selected list
 */
export function pickWeightedRandoms<T extends Record<string, any>>(
  amount: number,
  set: (T & { weight: number })[],
  guaranteePresenceOfAll = false,
): (T & { weight: number })[] {
  const weights = set.map(({ weight }) => {
    return weight
  })
  const totalWeight = sum(weights)
  const percentages = weights.map((weight) => {
    return weight / totalWeight
  })

  const weightedSet = percentages
    .map((weight, idx) => {
      return {
        idx,
        originalWeight: set[idx].weight,
        weight: Math.ceil(weight * amount),
      }
    })
    .sort((a, b) => {
      if (guaranteePresenceOfAll) {
        return a.originalWeight - b.originalWeight
      }

      return b.originalWeight - a.originalWeight
    })
    .flatMap(({ weight, idx }) => {
      return repeat(set[idx], weight)
    })
    .slice(0, amount)

  return randomSort(weightedSet)
}
