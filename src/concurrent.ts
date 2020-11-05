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
