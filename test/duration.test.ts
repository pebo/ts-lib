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
  const twoHours = Duration.parse("2H");
  expect(twoHours.millis()).toBe(2 * 60 * 60 * 1000);

  const fourMinutes = Duration.parse("4M");
  expect(fourMinutes.millis()).toBe(4 * 60 * 1000);

  const fiveSeconds = Duration.parse("5S");
  expect(fiveSeconds.millis()).toBe(5 * 1000);

  const oneDate = Duration.parse("1D");
  expect(oneDate.millis()).toBe(86400 * 1000);
});

test("duration parse bad input", async () => {
  expect(() => Duration.parse("1x")).toThrow(Error);
  expect(() => Duration.parse("H")).toThrow(Error);
});
