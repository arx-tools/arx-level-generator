import assert from 'assert'
import { describe, it } from 'mocha'
import { isBetween, normalizeDegree } from '../src/helpers'

describe('isBetween', () => {
  it('returns true when the 3rd number is between the first 2', () => {
    assert.strictEqual(isBetween(0, 100, 17), true)
  })
  it('returns true when the 3rd number is the same as the 1st', () => {
    assert.strictEqual(isBetween(0, 100, 0), true)
  })
  it('returns false when the 3rd number is the same as the 2nd', () => {
    assert.strictEqual(isBetween(0, 100, 100), false)
  })
})

describe('normalizeDegree', () => {
  it('leaves input number as is if it is between 0 and 360', () => {
    assert.strictEqual(normalizeDegree(0), 0)
    assert.strictEqual(normalizeDegree(159), 159)
    assert.strictEqual(normalizeDegree(359), 359)
  })
  it('turns 360 into 0', () => {
    assert.strictEqual(normalizeDegree(360), 0)
  })
  it('turns negative numbers into positive', () => {
    assert.strictEqual(normalizeDegree(-1022), 58)
  })
  it('can work with decimal numbers too', () => {
    assert.strictEqual(normalizeDegree(702.86), 342.86)
  })
})
