import { fetchR } from "../src/fetch-r";

import nock from "nock";

afterEach(() => {
  nock.cleanAll();
});

test("happy flow", async () => {
  const basePath = "http://www.example.com";
  const scope = nock(basePath)
    .get('/api')
    .reply(200, { message: 'Mocked data' });

  const response = await fetchR("http://www.example.com/api", { method: "GET" });
  expect(response.status).toBe(200);
  // Assert that the mocked path was called
  expect(scope.isDone()).toBe(true);
});

test("success after initial one 503", async () => {
  const basePath = "http://www.example.com";
  const scope = nock(basePath)
    .get('/api')
    .reply(503, { message: 'Error' })
    .get('/api')
    .reply(200, { message: 'Mocked data' });

  const response = await fetchR("http://www.example.com/api", { method: "GET" }, { retryDelay: 1 });
  expect(response.status).toBe(200);
  // Assert that the mocked path was called
  expect(scope.isDone()).toBe(true);
});

test("success after initial two 503s", async () => {
  const basePath = "http://www.example.com";
  const scope = nock(basePath)
    .get('/api')
    .reply(503, { message: 'Error' })
    .get('/api')
    .reply(503, { message: 'Error' })
    .get('/api')
    .reply(200, { message: 'Mocked data' });

  const onRetryAttemptMock = jest.fn();
  const response = await fetchR("http://www.example.com/api",
    { method: "GET" },
    {
      retryDelay: 1,
      onRetryAttempt: onRetryAttemptMock,
    });
  expect(response.status).toBe(200);
  expect(onRetryAttemptMock).toHaveBeenCalledTimes(2);
  // Assert that the mocked path was called
  expect(scope.isDone()).toBe(true);
});

test("fail after initial three 503s", async () => {
  const basePath = "http://www.example.com";
  const scope = nock(basePath)
    .get('/api')
    .reply(503, { message: 'Error' })
    .get('/api')
    .reply(503, { message: 'Error' })
    .get('/api')
    .reply(503, { message: 'Error' });

  const response = await fetchR("http://www.example.com/api", { method: "GET" }, { retryDelay: 1 });
  expect(response.status).toBe(503);
  // Assert that the mocked path was called
  expect(scope.isDone()).toBe(true);
});


test("retry ECONNRESET", async () => {
  class FakeCause extends Error {
    code: string;
    constructor() {
      super("connect ECONNRESET");
      this.code = "ECONNRESET";
    }
  }

  class FakeFetchError extends TypeError {
    constructor() {
      super("fetch failed");
      this.name = "TypeError";
      this.cause = new FakeCause();
    }
  }

  const basePath = "http://www.example.com";
  const scope = nock(basePath)
    .get('/api')
    .replyWithError(new FakeFetchError())
    .get('/api')
    .reply(200, { message: 'Ok' });


  const onRetryAttemptMock = jest.fn();
  const response = await fetchR("http://www.example.com/api", { method: "GET" }, { retryDelay: 1, onRetryAttempt: onRetryAttemptMock });
  expect(response.status).toBe(200);
  expect(onRetryAttemptMock).toHaveBeenCalledTimes(1);
  // Assert that the mocked path was called
  expect(scope.isDone()).toBe(true);

});


test("fail after timeout", async () => {
  const basePath = "http://www.example.com";
  const scope = nock(basePath)
    .get('/api')
    .delay(500)
    .reply(200, { message: 'Ok' })
    .get('/api')
    .delay(500)
    .reply(200, { message: 'Ok' });
  await expect(fetchR("http://www.example.com/api", { method: "GET" }, { retryDelay: 1, retryAttempts: 1, timeout: 100 })).rejects.toThrow("The operation was aborted due to timeout");
});


test("retries after first timeout", async () => {
  const basePath = "http://www.example.com";
  let callCount = 0;
  const scope = nock(basePath)
    .get('/api')
    .reply(() => {
      callCount++;
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('callCount1', callCount, new Date().toISOString());

          resolve([200, { message: 'Hello' }]);
        }, 300); // Delay longer than the timeout
      });
    })
    .get('/api')
    .reply(200, () => {
      callCount++;
      console.log('callCount2', callCount, new Date().toISOString());
      return { message: '2Ok' };
    })


  const onRetryAttemptMock = jest.fn();

  try {
    await fetchR("http://www.example.com/api", { method: "GET" }, { retryAttempts: 2, retryDelay: 500, onRetryAttempt: onRetryAttemptMock, timeout: 200 });
    expect(true).toBe(false);
  } catch (e) {
    expect(callCount).toBe(2);
    expect(onRetryAttemptMock).toHaveBeenCalledTimes(2);
  }
});
