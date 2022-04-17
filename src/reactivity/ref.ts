// TODO: implement `Ref`

import {
  isTracking,
  ReactiveEffect,
  trackEffects,
  triggerEffects
} from "./effect"

type UnRef<T> = T extends RefImpl<infer V> ? V : T

export class RefImpl<T> {
  // private _rawValue: T
  private _value: T
  public dep = new Set<ReactiveEffect>()
  public _v_isRef = true
  constructor(value: T) {
    // this._rawValue = value
    // TODO: if value is a object, it should be reactive
    this._value = value
  }
  get value() {
    // collect effects(if it calls from `effect` function)
    trackRefValue(this)
    return this._value as T
  }
  set value(value: T) {
    if (value === this._value) { return }
    // re-run effects
    this._value = value
    // set before trigger
    triggerRefValue(this)
  }
}
function triggerRefValue(ref: RefImpl<any>) {
  triggerEffects(ref.dep)
}
function trackRefValue(ref: RefImpl<any>) {
  if (!isTracking()) { return }
  trackEffects(ref.dep)
}

export function createRef<T>(value: T) {
  return new RefImpl(value)
}
export function ref<T>(value: T) {
  return createRef(value)
}
export function unRef<T extends RefImpl<any>>(ref: T) {
  return (isRef(ref) ? ref.value : ref) as UnRef<T>
}
export function isRef(value: any) {
  return !!value?._v_isRef
}