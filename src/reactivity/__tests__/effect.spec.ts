import { describe, expect, it, vi } from 'vitest'
import { effect, ReactiveEffect } from '../effect'
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

  describe('scheduler', () => {
    it('test scheduler', () => {
      const count = ref(1)
      // const computed = new computed()
      const schedular = vi.fn(() => {
        // console.log('reactiveEffect schedular re-run')
      })
      const effect = new ReactiveEffect(() => count.value, schedular)
      // effect was collected after run()
      effect.run()
      expect(schedular).not.toBeCalled()
      // then change the count.value, schedular will be triggered
      count.value = 2
      expect(schedular).toBeCalledTimes(1)
    })
  })

  it('no schedular & stop effect', () => {
    const count = ref(1)
    const getter = vi.fn(() => count.value * 2)
    const effect = new ReactiveEffect(getter)
    expect(getter).toBeCalledTimes(0)
    // collect
    effect.run()
    expect(getter).toBeCalledTimes(1)
    // change
    count.value = 2
    expect(getter).toBeCalledTimes(2)
    effect.stop()
    count.value = 3
    expect(getter).toBeCalledTimes(2)
  })
})
