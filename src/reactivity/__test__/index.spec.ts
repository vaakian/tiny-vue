// start a vitest
import { describe, expect, it, test, vi } from 'vitest'
import { effect } from '../effect'
import { reactive } from '../reactive'

describe('reactivity', () => {
  it('proxy the same object that should be cached', () => {
    const target = {
      a: 1,
      b: 2
    }
    const proxy1 = reactive(target)
    const proxy2 = reactive(target)
    expect(proxy1).toBe(proxy2)
  })

  it('effect should be re-run', () => {
    const product = reactive({ price: 5, quantity: 3, total: 0 })

    effect(() => {
      product.total = product.price * product.quantity
    })
    product.price = 25
    expect(product.total).toBe(product.price * product.quantity)
  })
  it('effect should be re-run', () => {
    const product = reactive({ price: 5, quantity: 3, total: 0 })
    const effectFn = vi.fn(() => {
      product.total = product.price * product.quantity
    })
    // run effect immediately to track its dependencies
    effect(effectFn)
    product.quantity = 124
    expect(product.total).toBe(product.price * product.quantity)
    // the first is executed by watchEffect for collecting its dependencies,
    // the second is executed by the set => trigger
    expect(effectFn).toBeCalledTimes(2)
    // trigger another twice
    product.quantity = 128
    product.quantity = 127
    expect(effectFn).toBeCalledTimes(4)
  })
})