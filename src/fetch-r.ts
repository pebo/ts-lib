/**
 * The fetchR function is a wrapper around the fetch function that adds retry functionality, timeouts and sane defaults.
 *
 */

if (typeof fetch !== 'function') {
  throw new Error('fetch is not available.');
}

export interface RetryConfig {
  /**
   * The number of times to retry the request. Defaults to 2.
   */
  retryAttempts?: number;
  /**
   * The amount of time to initially delay the retry, in ms. Defaults to 1000ms.
   */
  retryDelay?: number;

  /**
   * Timeout for each request in ms.
   */
  timeout?: number;

  /**
   * Function to invoke when a retry attempt is to be made.
   */
  onRetryAttempt?: (currentAttempt: number, err: unknown) => void;

  /**
   * The HTTP response status codes that will automatically be retried.
   * Defaults to: [408, 429, 500, 502, 503, 504]
   */
  statusCodesToRetry?: number[];
}

export class RetryableFetchResponseError extends Error {
  constructor(readonly response: Response) {
    super('RetryableFetchResponseError');
    this.name = "RetryableFetchResponseError";
  }
}

function isTimeoutError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    if (
      'name' in error &&
      typeof error.name === 'string' &&
      error.name === 'TimeoutError'
    ) {
      return true;
    }
  }
  return false;
}

// see https://github.com/nodejs/undici/blob/main/types/errors.d.ts
function isNetworkError(error: unknown): error is TypeError {
  if (typeof error === 'object' && error !== null) {
    if (
      'name' in error &&
      error.name === 'TypeError' &&
      'message' in error &&
      (error.message === 'fetch failed' ||
        error.message === 'terminated')
    ) {
      return true;
    }
  }
  return false;
}

export async function fetchR(url: string, init?: RequestInit, retryConfig?: RetryConfig
): Promise<Response> {
  const effectiveConfig = {
    retryAttempts: 2,
    retryDelay: 1000,
    statusCodesToRetry: [408, 429, 500, 502, 503, 504],
    onRetryAttempt: (_attemptNo: number, _err: unknown) => { },
    ...retryConfig,
  };

  if (effectiveConfig.retryAttempts < 0 || effectiveConfig.retryDelay < 0) {
    throw new Error('retryAttempts and retryDelay must be greater than or equal to 0');
  }

  let lastError: unknown;
  for (
    let currentAttempt = 0;
    currentAttempt <= effectiveConfig.retryAttempts;
    currentAttempt++
  ) {
    const providedSignal = init?.signal;
    let timeoutSignal: AbortSignal | undefined = undefined;
    try {
      if (effectiveConfig.timeout) {
        timeoutSignal = AbortSignal.timeout(effectiveConfig.timeout);
      }
      const signal = providedSignal && timeoutSignal ? AbortSignal.any([providedSignal, timeoutSignal]) : providedSignal || timeoutSignal;

      if (currentAttempt !== 0) {
        if (effectiveConfig.retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, effectiveConfig.retryDelay));
        }
        effectiveConfig.onRetryAttempt(currentAttempt, lastError);
      }

      const resp = await fetch(url, { ...init, signal });

      if (effectiveConfig.statusCodesToRetry.includes(resp.status)) {
        throw new RetryableFetchResponseError(resp);
      }
      return resp;
    } catch (err: unknown) {
      // Fetch API throws a TypeError when it fails with network error
      // We can also throw a TimeoutError if the request times out
      // We throw RetryableFetchResponseError to indicate that the response is retryable
      lastError = err;
      const isRetryable = err instanceof RetryableFetchResponseError ||
        isTimeoutError(err) ||
        (isNetworkError(err) && (err as any)?.cause?.code === 'ECONNRESET')
      if (!isRetryable) {
        throw err
      }
    }
  }
  if (lastError instanceof RetryableFetchResponseError) {
    return lastError.response;
  }
  throw lastError;
}
