import { describe, expect, it, vi } from 'vitest'
import { effect } from '../effect'
import { ref } from '../ref'

describe('effect', () => {
  it('when effect stops', () => {
    const count = ref(10)
    let double = count.value * 2
    const fn = vi.fn()
    const reactiveEffect = effect(() => {
      double = count.value * 2
      fn()
    })
    // no tracking and no trigger
    reactiveEffect.stop()
    count.value = 999
    expect(reactiveEffect.active).toBe(false)
    expect(fn).toBeCalledTimes(1)
    expect(double).not.toBe(count.value * 2)
    // manually trigger it
    reactiveEffect.run()
    expect(fn).toBeCalledTimes(2)
    expect(double).toBe(count.value * 2)
  })
})
