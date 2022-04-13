import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export type Key = string | symbol

// A dependency which is a set of `effects` 
// that should get re-run when values change 
// for each property of ONE `target`
// cache the reactive result of each `target`
type ProxyCache = WeakMap<any, any>

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends {} ? DeepReadonly<T[P]> : T[P]
}

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}


// to cache the reactive result of each `target`
// by using WeakMap, the `value` can be automatically garbage collected
// when `target` is no more strongly referenced
// such as a property is deleted (delete foo['bar'])
const reactiveMap: ProxyCache = new WeakMap()
const readonlyMap: ProxyCache = new WeakMap()
const shallowReactiveMap: ProxyCache = new WeakMap()
const shallowReadonlyMap: ProxyCache = new WeakMap()

function createReactiveObject<T extends Record<Key, any>>(target: T, proxyMap: ProxyCache, baseHandler: ProxyHandler<T>): T {
  // create a target => depsMap(stores `effects` for each property)
  // duplicated proxy is cached, safe to use
  if (!proxyMap.get(target)) {
    // proxy the `initTarget`
    const result = new Proxy(target, baseHandler)
    proxyMap.set(target, result)
  }
  return proxyMap.get(target)
}

export function reactive<T extends Record<Key, any>>(target: T): T {
  return createReactiveObject(target, reactiveMap, mutableHandlers) as T
}

export function readonly<T extends Record<Key, any>>(target: T): DeepReadonly<T> {
  return createReactiveObject(target, readonlyMap, readonlyHandlers) as DeepReadonly<T>
}

export function shallowReactive<T extends Record<Key, any>>(target: T): T {
  return createReactiveObject(target, shallowReactiveMap, shallowReactiveHandlers) as T
}
export function shallowReadonly<T extends Record<Key, any>>(target: T): Readonly<T> {
  return createReactiveObject(target, shallowReadonlyMap, shallowReadonlyHandlers) as Readonly<T>
}