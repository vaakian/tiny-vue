// start a vitest
import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  reactive,
  ReactiveFlags,
  readonly,
  shallowReactive,
  shallowReadonly,
  toRaw
} from '../reactive'

import { effect, trigger } from '../effect'

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

  it('total should be updated', () => {
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
  it('deep reactive', () => {
    const product = reactive({
      details: {
        name: '',
        count: 0
      }
    })
    const effectFn = vi.fn(() => {
      product.details.name
    })
    effect(effectFn)
    product.details.name = 'test'
    product.details.name = 'test2'
    expect(effectFn).toBeCalledTimes(3)
    // reference the same object
    expect(product.details).toBe(product.details)
  })
  it('shallow reactive', () => {
    const raw = {
      name: 'abc'
    }
    const product = shallowReactive({
      details: raw
    })
    expect(product.details).toBe(raw)

    const getRawName = vi.fn(() => {
      product.details.name
    })
    const getDetail = vi.fn(() => {
      product.details
    })
    effect(getRawName)
    effect(getDetail)
    // detail === raw, and it is not reactive
    product.details.name = 'def'
    product.details.name = 'ghi'
    product.details.name = 'jkl'
    expect(getRawName).toBeCalledTimes(1)
    expect(getDetail).toBeCalledTimes(1)
    product.details = {
      name: '777'
    }
    expect(getDetail).toBeCalledTimes(2)
  })

  it('shallow readonly', () => {
    const a = shallowReadonly({
      count: 7,
      b: {
        c: {
          d: {
            e: 'x'
          }
        }
      }
    })
    // @ts-ignore
    a.count++
    a.b.c.d.e = 'def'
    expect(a.count).toBe(7)
    // @ts-ignore
    expect(a.b[ReactiveFlags.IS_READONLY]).toBe(undefined)
    // @ts-ignore
    expect(a[ReactiveFlags.IS_READONLY]).toBe(true)
    // @ts-ignore
    expect(a[ReactiveFlags.IS_REACTIVE]).toBe(false)
    expect(a.b.c.d.e).toBe('def')
  })
  it('deep readonly', () => {
    const a = readonly({
      count: 7,
      b: {
        c: {
          d: {
            e: 'x'
          }
        }
      }
    })
    // @ts-ignore
    a.b.c.d.e = 'yhg'
    // @ts-ignore
    a.b = 'clean'
    // @ts-ignore
    expect(a[ReactiveFlags.IS_READONLY]).toBe(true)
    // @ts-ignore
    expect(a.b[ReactiveFlags.IS_READONLY]).toBe(true)
    // @ts-ignore
    expect(a.b.c[ReactiveFlags.IS_READONLY]).toBe(true)
    // @ts-ignore
    expect(a.b.c.d[ReactiveFlags.IS_READONLY]).toBe(true)
    // @ts-ignore
    expect(a.b.c.d.e).toBe('x')
  })
  it('toRaw', () => {
    const target = {
      family: {
        name: 'abc',
        house: {
          address: '123',
          size: 120
        }
      }
    }
    const reactiveTarget = reactive(target)
    expect(toRaw(reactiveTarget)).toBe(target)
    expect(reactiveTarget).not.toBe(target)

    expect(toRaw(reactiveTarget.family)).toBe(target.family)
    expect(toRaw(reactiveTarget.family.house)).toBe(target.family.house)
  })
  it('depsMap not exists, triggers nothing', () => {
    trigger({}, 'a')
  })
})