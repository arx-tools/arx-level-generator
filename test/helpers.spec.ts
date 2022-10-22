import assert from 'assert'
import { describe, it } from 'mocha'
import { isBetween, normalizeDegree, flipUVHorizontally, flipUVVertically, rotateUV } from '../src/helpers'
import { UVQuad } from '../src/types'

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
  it('turns -360 into 0', () => {
    assert.strictEqual(normalizeDegree(-360), 0)
  })
  it('turns negative numbers into positive', () => {
    assert.strictEqual(normalizeDegree(-1022), 58)
  })
  it('can work with decimal numbers too', () => {
    assert.strictEqual(normalizeDegree(702.86), 342.86)
  })
})

describe('flipUVHorizontally', () => {
  it('switches the first 2 elements of the array with the last 2', () => {
    const input: UVQuad = [
      { u: 1, v: 0 },
      { u: 1, v: 1 },
      { u: 0, v: 0 },
      { u: 0, v: 1 },
    ]
    const expectedResult: UVQuad = [
      { u: 0, v: 0 },
      { u: 0, v: 1 },
      { u: 1, v: 0 },
      { u: 1, v: 1 },
    ]
    assert.deepStrictEqual(flipUVHorizontally(input), expectedResult)
  })
})

describe('flipUVVertically', () => {
  it('switches the first 2 elements and the last 2 elements', () => {
    const input: UVQuad = [
      { u: 1, v: 0 },
      { u: 1, v: 1 },
      { u: 0, v: 0 },
      { u: 0, v: 1 },
    ]
    const expectedResult: UVQuad = [
      { u: 1, v: 1 },
      { u: 1, v: 0 },
      { u: 0, v: 1 },
      { u: 0, v: 0 },
    ]
    assert.deepStrictEqual(flipUVVertically(input), expectedResult)
  })
})

describe('rotateUV', () => {
  it('leaves the input as is if the given degree is 0 or a multiple of 360', () => {
    const input: UVQuad = [
      { u: 1, v: 0 },
      { u: 1, v: 1 },
      { u: 0, v: 0 },
      { u: 0, v: 1 },
    ]
    assert.deepStrictEqual(rotateUV(0, [0.5, 0.5], input), input)
    assert.deepStrictEqual(rotateUV(360, [0.5, 0.5], input), input)
    assert.deepStrictEqual(rotateUV(-360, [0.5, 0.5], input), input)
  })
})
