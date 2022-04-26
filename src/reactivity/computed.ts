// TODO: implement `computed'
// const computedValue = computed(getter: () => any);

import {
  isTracking,
  ReactiveEffect,
  trackEffects,
  triggerEffects,
} from './effect'

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
  private _shouldReCalculate = true
  constructor(private getter: () => T) {
    // when the value of the given getter relies changes.
    this.effect = new ReactiveEffect(this.getter, () => {
      // if no `get value`, triggerComputedValue will not be executed if the getter calls/changes
      if (!this._shouldReCalculate) {
        // tag as `shouldReCalculate` for get value() to update.
        this._shouldReCalculate = true
        triggerComputedValue(this)
      } else {
        // already tagged as `shouldReCalculate`
        // if no get triggered, it will be ignored
        // do nothing
      }
    })
  }
  get value() {
    // no relation with `this.effect`
    // just tracks those `effects` relies on this.value
    trackComputedValue(this)
    if (this._shouldReCalculate) {
      // mark as `shouldReCalculate` to avoid re-run,
      // changes only if the value in the effect's dep changes.
      this._shouldReCalculate = false
      // re-run the effect, it will be collected at the first-run
      this._value = this.effect.run()
    }
    return this._value
  }
}

export function triggerComputedValue(computed: ComputedRefImpl<any>) {
  triggerEffects(computed.dep)
}

export function trackComputedValue(computed: ComputedRefImpl<any>) {
  if (!isTracking()) {
    return
  }
  trackEffects(computed.dep)
}

export function computed<T>(getter: () => T) {
  return new ComputedRefImpl<T>(getter)
}
