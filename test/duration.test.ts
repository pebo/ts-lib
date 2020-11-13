import { Duration } from "../src/duration";

test("duration equality", async () => {
  const h = Duration.ofHours(2);
  const m = Duration.ofMinutes(2 * 60);
  const s = Duration.ofSeconds( 2* 60 * 60);
  expect(h).toEqual(m);
  expect(s).toEqual(h);
  expect(Duration.ofDays(2)).toEqual(Duration.ofHours(48));
});

test("duration parse", async () => {
  /*
  const twoHours = Duration.parse("2H");
  expect(twoHours.millis()).toBe(2 * 60 * 60 * 1000);

  const fourtyMinutes = Duration.parse("40M");
  expect(fourtyMinutes.millis()).toBe(40 * 60 * 1000);

  const oneHundredSeconds = Duration.parse("100S");
  expect(oneHundredSeconds.millis()).toBe(100 * 1000);

  const oneDay = Duration.parse("1D");
  expect(oneDay.millis()).toBe(86400 * 1000);
  */

  const twenthyMs = Duration.parse("20ms");
  expect(twenthyMs.millis()).toBe(20);
});

test("duration parse bad input", async () => {
  expect(() => Duration.parse("1x")).toThrow(Error);
  expect(() => Duration.parse("H")).toThrow(Error);
});
