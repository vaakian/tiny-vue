import { Key } from "./reactive"
// ONE dependency which is a set of `effects` that should get re-run when property values change
type Dep = Set<ReactiveEffect>
// store the dependencies for each property
type DepsMap = Record<Key, Dep>
// store the dependencies associated with each reactive object's properties
type TargetMap = WeakMap<any, DepsMap>
// reactiveFn should be a function
type reactiveFn = () => any

const targetMap: TargetMap = new WeakMap()
let activeEffect: ReactiveEffect | null = null
let shouldTrack = false

export class ReactiveEffect {
  active = true
  // to track those deps that includes this Effect, so as to cleanupEffects
  deps: Set<Dep> = new Set()
  constructor(public fn: reactiveFn) {
  }
  run() {
    if (!this.active) {
      return this.fn()
    }
    // enable effect tracking
    shouldTrack = true
    activeEffect = this
    const returnValue = this.fn()
    // disable effect tracking
    shouldTrack = false
    activeEffect = null
    return returnValue
  }
  stop() {
    if (this.active) {
      this.active = false
      // cleanup this effect from all deps
      // this effect should be GC(garbage collection) to which if no more strong reference
      cleanupEffect(this)
    }
  }
}
/**
 * clear itself from all deps that includes the first parameter {@link effect}
 * @param effect 
 */
function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach(dep => dep.delete(effect))
  // TODO: cleanup
}
export function track(target: any, key: Key) {
  if (!isTracking()) { return }
  // deps was created when it's needed!
  // if getter triggers, that property is needed!
  if (!targetMap.get(target)) {
    targetMap.set(target, {})
  }
  const depsMap = targetMap.get(target) as DepsMap
  if (activeEffect !== null) {
    let dep = depsMap[key]
    if (!dep) {
      dep = depsMap[key] = new Set()
    }
    trackEffects(dep)
  }
}


/**
 * re-run the `effects` when the value of the {@link target}'s {@link key} changes
 * @param target as a key to find the depsMap(property => deps)
 * @param key specific property to find the deps(a set of effects)
 * @returns void
 */
export function trigger(target: any, key: Key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) { return }
  // dep is a set of `effects`
  const dep = depsMap[key]
  dep && triggerEffects(dep)
}
/**
 * create a new {@link ReactiveEffect} and run it immediately,
 * so it will be set to {@link activeEffect} to be collected.
 * @param fn as the main Reactive Action of the ReactiveEffect
 * @returns ReactiveEffect instance
 */
export function effect(fn: reactiveFn) {
  const effect = new ReactiveEffect(fn)
  // run immediately => trackEffects
  effect.run()
  return effect
}

/**
 * collect {@link activeEffect} to the given {@link dep}
 * and also mark it on deps of {@link activeEffect}(to cleanup)
 * @param dep 
 */
export function trackEffects(dep: Dep) {
  if (activeEffect) {
    dep.add(activeEffect)
    // deps is for cleanupEffect
    activeEffect.deps.add(dep)
  }
}

/**
 * re-run all effects of {@link dep}
 * @param dep a set of effects to be called
 */
export function triggerEffects(dep: Dep) {
  dep.forEach(effect => {
    effect.run()
  })
}

/**
 * get to know if the `getter` is caused by {@link effect}, otherwise return `false`,
 * so as NOT to collect the effect.
 * @returns true if the current execution is a {@link ReactiveEffect}
 */
export function isTracking() {
  return shouldTrack && activeEffect !== null
}
