import { Duration, TimeUnit } from "../src/yoda-time";

test("duration equality", async () => {
  const h = Duration.ofHours(2);
  const m = Duration.ofMinutes(2 * 60);
  const s = Duration.ofSeconds( 2* 60 * 60);
  expect(h).toEqual(m);
  expect(s).toEqual(h);
  expect(Duration.ofDays(2)).toEqual(Duration.ofHours(48));
  expect(Duration.ofMillis(3000)).toEqual(Duration.ofSeconds(3));
});

test("of timeunit", async () => {
  expect(Duration.ofUnit(48, TimeUnit.hours)).toEqual(Duration.ofDays(2));
});

test("duration parse", async () => {
  const twoHours = Duration.parse("2H");
  expect(twoHours.millis()).toBe(2 * 60 * 60 * 1000);

  const fourtyMinutes = Duration.parse("40M");
  expect(fourtyMinutes.millis()).toBe(40 * 60 * 1000);

  const oneHundredSeconds = Duration.parse("100S");
  expect(oneHundredSeconds.millis()).toBe(100 * 1000);

  const oneDay = Duration.parse("1D");
  expect(oneDay.millis()).toBe(86400 * 1000);

  const twenthyMs = Duration.parse("20ms");
  expect(twenthyMs.millis()).toBe(20);
});

test("duration parse negative", async () => {
  const minusFourtyMinutes = Duration.parse("-40M");
  expect(minusFourtyMinutes.millis()).toBe(-40 * 60 * 1000);
});


test("compare durations", async () => {
  expect(Duration.ofHours(2).isGreaterThan(Duration.ofMinutes(2))).toBe(true);
  expect(Duration.ofMinutes(22).isLessThan(Duration.ofMinutes(23))).toBe(true);
});

test("duration parse bad input", async () => {
  expect(() => Duration.parse("1x")).toThrow(Error);
  expect(() => Duration.parse("H")).toThrow(Error);
  expect(() => Duration.parse("2")).toThrow(Error);
});
