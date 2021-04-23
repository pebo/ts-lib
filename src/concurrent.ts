/**
 * Wrapper allowing one ongoing call at a time to the wrapped function.
 * @param fn function to wrap
 */
export const singleInFlightFn = <T>(fn: () => Promise<T>) => {
  // based on https://spin.atomicobject.com/2018/09/10/javascript-concurrency/
  let inFlight: Promise<T> | false = false;

  return () => {
    if (!inFlight) {
      inFlight = (async () => {
        try {
          return await fn();
        } finally {
          inFlight = false;
        }
      })();
    }
    return inFlight;
  };
};

/**
 * Representation of a value that is valid until a given point in time.
 */
export interface ExpiringValue<T> {
  value: T;
  expiryTime: number;
}

/**
 * Class caching a value with expiry time.
 *
 */
export class SingleInFlightCachingValueProvider<T> {
  private expiringValue?: ExpiringValue<T>;
  private fetchOngoing: boolean = false;
  private fetchFn: () => Promise<ExpiringValue<T>>;

  /**
   *
   * @param fetchDelegateFn fn returning a value together with an expiry time
   * @param prefetchPeriod the period of time before expiry time that the value retrieval should start
   * @param timeRemaining the period of time for which a cached value must valid, e.g. to avoid using a token that will soon expire
   */
  constructor(fetchDelegateFn: () => Promise<ExpiringValue<T>>, readonly prefetchPeriod: number, readonly timeRemaining: number = 0) {
    this.fetchFn = singleInFlightFn(fetchDelegateFn);
  }

  /**
   * Returns the current cached value or fetches a new value using the value fetch delegate.
   */
  async get(): Promise<T> {
    // cached value absent or (soon) expired
    if (!this.expiringValue || Date.now() > (this.expiringValue.expiryTime - this.timeRemaining)) {
      this.expiringValue = await this.fetchFn();
      return this.expiringValue.value;
    }
    // cached value ok
    if (Date.now() < (this.expiringValue.expiryTime - this.prefetchPeriod - this.timeRemaining)) {
      return this.expiringValue.value;
    }

    // value refresh ongoing
    if (this.fetchOngoing) {
      return this.expiringValue.value;
    }
    // start value refresh
    this.fetchOngoing = true;
    try {
      this.expiringValue = await this.fetchFn();
    } finally {
      this.fetchOngoing = false;
    }
    return this.expiringValue.value;
  }

}
