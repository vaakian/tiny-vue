import { track, trigger } from "./effect"
import { Key, reactive, ReactiveFlags, readonly } from "./reactive"

// deep and not readonly
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
const shallowReactiveGet = createGetter(false, true)
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: any, key: Key, receiver: any) {
    // reserved keys
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }

    let res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
      track(target, key)
    }
    // not shallow
    if (!shallow && isObject(res)) {
      // reactive is cached, so it's safe to use it
      return isReadonly ? readonly(res) : reactive(res)
    }
    // not shallow and current property is NOT an object
    return res
  }

}
export function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null
}

function createSetter() {
  return function set(target: any, key: Key, value: any) {
    // same value no trigger
    if (target[key] !== value) {
      Reflect.set(target, key, value)
      // set first then trigger gets the new value
      trigger(target, key)
    }
    return true
  }
}

export const mutableHandlers: ProxyHandler<Record<Key, any>> = {
  get,
  set
}
export const readonlyHandlers: ProxyHandler<Record<Key, any>> = {
  get: readonlyGet,
  set() {
    console.warn(
      'Set operation on a "readonly" is not allowed. Use "reactive" instead.'
    )
    return true
  }
}

export const shallowReactiveHandlers: ProxyHandler<Record<Key, any>> = {
  get: shallowReactiveGet,
  set
}
export const shallowReadonlyHandlers: ProxyHandler<Record<Key, any>> = {
  get: shallowReadonlyGet,
  set: readonlyHandlers.set
}