import { describe, expect, it, test, vi } from 'vitest'
import { effect } from '../effect'
import { isRef, ref, unRef } from '../ref'

describe('ref', () => {
  it('ref effects', () => {
    const count = ref(1)
    let double = count.value * 2
    effect(() => {
      // effect
      double = count.value * 2
    })
    count.value = 999
    console.log(count)
    expect(double).toBe(count.value * 2)
  })

  it('unRef referentially equal', () => {
    const target = { name: 'xwj' }
    const refTarget = ref(target)
    expect(unRef(refTarget)).toBe(target)
    expect(refTarget).not.toBe(target)
  })

  it('isRef judge', () => {
    const target = {}
    const refTarget = ref(target)
    expect(isRef(refTarget)).toBe(true)
    expect(isRef(target)).toBe(false)
  })
})