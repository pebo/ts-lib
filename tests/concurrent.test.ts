import { singleInFlightFn, ExpiringValue, SingleInFlightCachingValueProvider } from "../src/concurrent";

let counter = 0;
async function slowFn(): Promise<number> {
  console.log("working...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  counter++;
  console.log("done");
  return counter;
}

let hasFailed = false;
async function failOnce(): Promise<number> {
  console.log("working...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (!hasFailed) {
    hasFailed = true
    throw new Error("Failed");
  }
  return 1;
}

async function expectError(p: Promise<any>) {
  try {
    await p;
    expect(true).toBe(false);
  } catch (e) {
    expect((e as Error).message).toMatch("Failed");
  }
}

beforeEach( () => {
  counter = 0;
  hasFailed = false;
});

test("slowFn should be called once", async () => {
  const fun = singleInFlightFn(slowFn);

  const delay = new Promise((resolve) => setTimeout(resolve, 100));
  const secondPromise = delay.then( () => fun());
  const firstResult = await fun();
  const secondResult = await secondPromise;

  expect(counter).toBe(1);
  expect(firstResult).toBe(1);
  expect(secondResult).toBe(1);
});

test("failOnce should be called once", async () => {
  const fun = singleInFlightFn(failOnce);

  const delay = new Promise((resolve) => setTimeout(resolve, 100));
  const secondPromise = delay.then( () => fun());
  const firstPromise = fun();

  await expectError(firstPromise);
  await expectError(secondPromise);
  expect(hasFailed).toBe(true);

  // no in flight calls
  const thirdResult = await fun();
  expect(thirdResult).toBe(1);
});





test("CachingValueProvider", async () => {
  const delay = (period: number) => new Promise((resolve) => setTimeout(resolve, period));

  const fetchTime = 50;
  const expiryOffset = 500;
  let value = '';
  const valueFetcher = async () : Promise<ExpiringValue<string>>=> {
    await delay(fetchTime);
    value = value + 'a';
    return {
      value: value,
      expiryTime: Date.now() + expiryOffset
    }
  }

  const prefetchPeriod = 50;
  const tested = new SingleInFlightCachingValueProvider<string>(valueFetcher, prefetchPeriod);

  const value1 = await tested.get();
  expect(value1).toBe('a');
  const value2 = await tested.get();
  expect(value2).toBe('a');

  await delay(expiryOffset - prefetchPeriod);
  const valuePromise3 = tested.get();
  const valuePromise4 = tested.get();

  expect(await valuePromise3).toBe('aa');
  expect(await valuePromise4).toBe('a');
});
