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
    activeEffect = this
    const returnValue = this.fn()
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
function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach(dep => dep.delete(effect))
  // TODO: cleanup
}
export function track(target: any, key: Key) {
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


// re-run the corresponding `effects`
export function trigger(target: any, key: Key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) { return }
  depsMap[key] && triggerEffects(depsMap[key])
}

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

// re-run all effects
export function triggerEffects(dep: Dep) {
  dep.forEach(effect => {
    effect.run()
  })
}