import { describe, expect, it, vi } from 'vitest'
import { computed } from '../computed'
import { ref } from '../ref'


describe('computed', () => {
  const count = ref(1)
  const double = computed(() => count.value * 2)
  it('computed', () => {
    count.value = 2
    expect(double.value).toBe(count.value * 2)
  })
  it('depends on a computed value', () => {
    const fourTimes = computed(() => double.value * 2)
    expect(fourTimes.value).toBe(count.value * 4)
    // after count updates, double & fourTime also updates
    count.value = 10
    expect(double.value).toBe(count.value * 2)
    expect(fourTimes.value).toBe(count.value * 4)
  })
  it('computed cache', () => {
    const count = ref(1)
    const getter = vi.fn(() => count.value * 2)
    const double = computed(getter)
    double.value
    double.value
    double.value
    expect(getter).toBeCalledTimes(1)
  })
  it('lazy computed if no access to `value`', () => {
    const count = ref(1)
    const getter = vi.fn(() => count.value * 2)
    const double = computed(getter)
    expect(getter).toBeCalledTimes(0)
  })

})