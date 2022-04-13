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
  // 用于追踪依赖当前Effect的对象，可以用来清除依赖
  deps: Set<Dep> = new Set()
  constructor(public fn: reactiveFn) {
    // console.log('ReactiveEffect init')
  }
  run() {
    if (!this.active) {
      return this.fn()
    }
    // console.log('ReactiveEffect run')
    activeEffect = this
    const result = this.fn()
    activeEffect = null
    return result
  }
  stop() {
    if (this.active) {
      this.active = false
      // 将所有包含这个effect的deps都从其中清除
      // 之后这个effect如果没有任何其它饮用，就应该要被GC掉
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