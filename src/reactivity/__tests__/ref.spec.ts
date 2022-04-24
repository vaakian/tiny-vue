import { describe, expect, it, vi } from 'vitest'
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
    expect(double).toBe(count.value * 2)
  })

  it('unRef referentially equal', () => {
    const target = { name: 'xwj' }
    const refTarget = ref(target)
    expect(unRef(refTarget)).toBe(target)
    // @ts-ignore
    expect(unRef(target)).toBe(target)
    expect(refTarget.value).toBe(target)
    expect(refTarget).not.toBe(target)
  })

  it('isRef judge', () => {
    const target = {}
    const refTarget = ref(target)
    expect(isRef(refTarget)).toBe(true)
    expect(isRef(target)).toBe(false)
  })
  it('set the same value', () => {
    const r = ref(1)
    const fn = vi.fn(() => {
      r.value
    })
    expect(fn).toBeCalledTimes(0)
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    r.value = 1
    r.value = 1
    r.value = 1
    expect(fn).toBeCalledTimes(1)
    r.value = 2
    r.value = 3
    expect(fn).toBeCalledTimes(3)
  })
})
