import { track, trigger } from "./effect"
import { Key } from "./reactive"


function createGetter(isReadonly = false, shallow = false) {
  return function get(target: any, key: Key) {
    track(target, key)
    return Reflect.get(target, key)
  }
}

function createSetter() {
  return function set(target: any, key: Key, value: any) {
    // same value no trigger
    if (target[key] !== value) {
      Reflect.set(target, key, value)
      // set first then trigger can get the new value
      trigger(target, key)
    }
    return true
  }
}

export const mutableHandlers: ProxyHandler<Record<Key, any>> = {
  get: createGetter(),
  set: createSetter()
}
export const readonlyHandlers: ProxyHandler<Record<Key, any>> = {
  get: createGetter(),
  set: createSetter()
}

