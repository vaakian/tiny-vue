// start a vitest
import { describe, expect, it, test, vi } from 'vitest'
import { reactive, watchEffect } from '..'

describe('reactivity', () => {
  it('proxy the same object that should cached', () => {
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

    watchEffect(() => {
      product.total = product.price * product.quantity
    })
    product.price = 25
    expect(product.total).toBe(product.price * product.quantity)
  })
  it('effect should be re-run', () => {
    const product = reactive({ price: 5, quantity: 3, total: 0 })
    const effect = vi.fn(() => {
      product.total = product.price * product.quantity
    })
    // run effect immediately to track its dependencies
    watchEffect(effect)
    product.quantity = 124
    expect(product.total).toBe(product.price * product.quantity)
    expect(effect).toBeCalledTimes(2)
  })
})