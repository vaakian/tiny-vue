import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers
} from "./baseHandlers"

export type Key = string | symbol

// A dependency which is a set of `effects` 
// that should get re-run when values change 
// for each property of ONE `target`
// cache the reactive result of each `target`
type ProxyCache = WeakMap<any, any>

export const enum ReactiveFlags {
  IS_READONLY = '__v_isReadonly',
  IS_REACTIVE = '__v_isReactive',
  RAW = '__v_raw',
}
type InternalFlag<T> = {
  [ReactiveFlags.IS_READONLY]: boolean,
  [ReactiveFlags.IS_REACTIVE]: boolean,
  [ReactiveFlags.RAW]: T
}

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Record<any, any> ? DeepReadonly<T[P]> : T[P]
} & InternalFlag<T>

type Reactive<T> = T & InternalFlag<T>
type DeepReactive<T> = {
  [P in keyof T]: T[P] extends Record<any, any> ? DeepReactive<T[P]> : T[P]
} & InternalFlag<T>
// to cache the reactive result of each `target`
// by using WeakMap, the `value` can be automatically garbage collected
// when `target` is no more strongly referenced
// such as a property is deleted (delete foo['bar'])
const reactiveMap: ProxyCache = new WeakMap()
const readonlyMap: ProxyCache = new WeakMap()
const shallowReactiveMap: ProxyCache = new WeakMap()
const shallowReadonlyMap: ProxyCache = new WeakMap()

function createReactiveObject<T extends Record<Key, any>>(target: T, proxyMap: ProxyCache, baseHandler: ProxyHandler<T>): Reactive<T> {
  // create a target => depsMap(stores `effects` for each property)
  // proxy of the same `target` is cached, safe to use
  if (!proxyMap.get(target)) {
    // proxy the `initTarget`
    const result = new Proxy(target, baseHandler)
    // cache the proxy, will NOT break the origin `target`
    proxyMap.set(target, result)
  }
  return proxyMap.get(target)
}

export function reactive<T extends Record<Key, any>>(target: T) {
  return createReactiveObject(target, reactiveMap, mutableHandlers) as DeepReactive<T>
}

export function readonly<T extends Record<Key, any>>(target: T): DeepReadonly<T> {
  return createReactiveObject(target, readonlyMap, readonlyHandlers) as DeepReadonly<T>
}

export function shallowReactive<T extends Record<Key, any>>(target: T) {
  return createReactiveObject(target, shallowReactiveMap, shallowReactiveHandlers)
}
export function shallowReadonly<T extends Record<Key, any>>(target: T): Readonly<T> {
  return createReactiveObject(target, shallowReadonlyMap, shallowReadonlyHandlers) as Readonly<T> & InternalFlag<T>
}
export function toRaw<T>(target: Reactive<T>): T {
  return target[ReactiveFlags.RAW] || target
}