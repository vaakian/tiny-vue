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
      cleanupEffect(this)
    }
  }
}
function cleanupEffect(effect: ReactiveEffect) {
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
    if (!depsMap[key]) {
      depsMap[key] = new Set()
    }
    depsMap[key].add(activeEffect)
    activeEffect.deps.add(depsMap[key])
  }
}
// re-run the corresponding `effects`
export function trigger(target: any, key: Key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) { return }
  depsMap[key]?.forEach(effect => effect.run())
}

export function effect(fn: reactiveFn) {
  const effect = new ReactiveEffect(fn)
  // 立即执行 => 收集依赖
  effect.run()
  return effect
}