// TODO: implement `computed'
// const computedValue = computed(getter: () => any);

import {
  effect,
  isTracking,
  ReactiveEffect,
  trackEffects,
  triggerEffects
} from "./effect"

export class ComputedRefImpl<T> {
  // @ts-ignore
  private _value: T
  /**
   * this effect will re-run when the value the referred in the given {@link getter} changes.
   * then update {@link _value} and re-run all the effects in {@link dep} to notify the changes.
   */
  public effect: ReactiveEffect
  /**
   * those `effects` depends on `this.value`
   */
  public dep: Set<ReactiveEffect> = new Set()
  constructor(private getter: () => T) {
    // when the value of the given getter relies changes.
    this.effect = effect(() => {
      this._value = this.getter()
      // when it updates, trigger all the effects
      triggerComputedValue(this)
    })
  }
  get value() {
    // no relation with `this.effect`
    // just tracks those `effects` relies on this.value
    trackComputedValue(this)
    return this._value
  }
}
export function triggerComputedValue(computed: ComputedRefImpl<any>) {
  triggerEffects(computed.dep)
}
export function trackComputedValue(computed: ComputedRefImpl<any>) {
  if (!isTracking()) { return }
  trackEffects(computed.dep)
}
export function computed<T>(getter: () => T) {
  return new ComputedRefImpl<T>(getter)
}