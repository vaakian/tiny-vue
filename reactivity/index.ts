type Key = string | symbol

// the core structure to store the relations.
type Effect = () => void

// A dependency which is a set of `effects` 
// that should get re-run when values change 
type Dep = Set<Effect>
// for each property of ONE `target`
type DepsMap = Record<Key, Dep>
// for each `target`
type TargetMap = WeakMap<any, DepsMap>

// cache the reactive result of each `target`
type TargetCache = WeakMap<any, DepsMap>

let currentEffect: Effect | null = null
const targetMap: TargetMap = new WeakMap()
const targetCache: TargetCache = new WeakMap()

function track(target: any, key: Key) {
  // deps was created when it's needed!
  // if getter triggers, that property is needed!
  if (!targetMap.get(target)) {
    targetMap.set(target, {})
  }
  const depsMap = targetMap.get(target) as DepsMap
  if (currentEffect !== null) {
    if (!depsMap[key]) {
      depsMap[key] = new Set()
    }
    depsMap[key].add(currentEffect)
  }
}
function trigger(target: any, key: Key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) { return }
  depsMap[key]?.forEach(effect => effect())
}
export function reactive<T extends Record<Key, any>>(initTarget: T): T {
  // create a target => depsMap(stores `effects` for each property)
  if (!targetCache.get(initTarget)) {
    // proxy the `initTarget`
    const result = new Proxy(initTarget, {
      get(target, key) {
        track(target, key)
        return Reflect.get(target, key)
      },
      set(target, key, value) {
        // same value no trigger
        if (target[key] !== value) {
          Reflect.set(target, key, value)
          // set first then trigger can get the new value
          trigger(target, key)
        }
        return true
      }
    })
    targetCache.set(initTarget, result)
    return result
  } else {
    return targetCache.get(initTarget) as T
  }
}

export const watchEffect = (effect: Effect) => {
  // for getter to track
  currentEffect = effect
  effect()
  currentEffect = null
}