import { repeat, sum } from '@src/faux-ramda.js'

export const randomSort = <T>(items: T[]) => {
  const copyOfItems = [...items]
  const sortedItems: T[] = []

  while (copyOfItems.length) {
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
export const pickWeightedRandoms = <T extends Record<string, any>>(
  amount: number,
  set: (T & { weight: number })[],
  guaranteePresenceOfAll = false,
) => {
  const weights = set.map(({ weight }) => weight)
  const totalWeight = sum(weights)
  const percentages = weights.map((weight) => weight / totalWeight)

  const weightedSet = percentages
    .map((weight, idx) => ({
      idx,
      originalWeight: set[idx].weight,
      weight: Math.ceil(weight * amount),
    }))
    .sort((a, b) => {
      if (guaranteePresenceOfAll) {
        return a.originalWeight - b.originalWeight
      } else {
        return b.originalWeight - a.originalWeight
      }
    })
    .flatMap(({ weight, idx }) => repeat(set[idx], weight))
    .slice(0, amount)

  return randomSort(weightedSet)
}

/**
 * creates a random floating point number between a (inclusive) and b (exclusive)
 */
export const randomBetween = (a: number, b: number) => {
  return a + Math.random() * (b - a)
}

/**
 * creates a random integer between min and max (both inclusive)
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
 */
export const randomIntBetween = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const pickRandoms = <T>(n: number, set: T[]) => {
  if (set.length <= n) {
    return set
  } else {
    const remaining = set.slice()
    let matches: T[] = []
    for (let i = 0; i < n; i++) {
      const idx = randomIntBetween(0, remaining.length - 1)
      matches = matches.concat(remaining.splice(idx, 1))
    }
    return matches
  }
}

export const pickRandom = <T>(set: T[]) => {
  return pickRandoms(1, set)[0]
}

export const pickRandomIdx = <T>(set: T[]) => {
  return pickRandom([...set.keys()])
}
