import { mutableHandlers } from "./baseHandler"

export type Key = string | symbol

// A dependency which is a set of `effects` 
// that should get re-run when values change 
// for each property of ONE `target`
// cache the reactive result of each `target`
type ProxyCache = WeakMap<any, any>

const reactiveCache: ProxyCache = new WeakMap()

function createReactiveObject<T extends Record<Key, any>>(target: T, proxyMap: ProxyCache, baseHandler: ProxyHandler<T>): T {
  // create a target => depsMap(stores `effects` for each property)
  if (!proxyMap.get(target)) {
    // proxy the `initTarget`
    const result = new Proxy(target, baseHandler)
    proxyMap.set(target, result)
  }
  return proxyMap.get(target) as T
}

export function reactive<T extends Record<Key, any>>(target: T): T {
  return createReactiveObject(target, reactiveCache, mutableHandlers) as T
}
