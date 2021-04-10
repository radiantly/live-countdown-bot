import { computeTimeDiff } from "../modules/computeTimeDiff.js";

describe("Time diff for humans", () => {
  test("diff < 1 min", () => {
    expect(computeTimeDiff(-1000).humanDiff).toEqual("less than a minute");
    expect(computeTimeDiff(0, Infinity, "en", true).humanDiff).toEqual("< 1min");
    expect(computeTimeDiff(100).humanDiff).toEqual("less than a minute");
    expect(computeTimeDiff(1000, Infinity, "en", true).humanDiff).toEqual("< 1min");
  });

  test("minutes", () => {
    expect(computeTimeDiff(10 * 60 * 1000).humanDiff).toEqual("10 minutes");
    expect(computeTimeDiff(9 * 60 * 1000, Infinity, "en", true).humanDiff).toEqual("9 mins");
  });

  test("hours", () => {
    expect(computeTimeDiff(2 * 60 * 60 * 1000).humanDiff).toEqual("2 hours");
    expect(computeTimeDiff(12 * 60 * 60 * 1000, Infinity, "en", true).humanDiff).toEqual("12 hrs");
  });

  test("days", () => {
    expect(computeTimeDiff(1 * 24 * 60 * 60 * 1000).humanDiff).toEqual("1 day");
    expect(computeTimeDiff(5 * 24 * 60 * 60 * 1000, Infinity, "en", true).humanDiff).toEqual(
      "5 days"
    );
  });

  test("weeks", () => {
    expect(computeTimeDiff(1 * 7 * 24 * 60 * 60 * 1000).humanDiff).toEqual("7 days");
    // expect(computeTimeDiff(1 * 7 * 24 * 60 * 60 * 1000).humanDiff).toEqual("1 week");
    // expect(computeTimeDiff(3 * 7 * 24 * 60 * 60 * 1000).humanDiff).toEqual("3 weeks");
    expect(computeTimeDiff(3 * 7 * 24 * 60 * 60 * 1000).humanDiff).toEqual("21 days");
    // expect(computeTimeDiff(13 * 7 * 24 * 60 * 60 * 1000, Infinity, "en", true).humanDiff).toEqual("13 wks");
    expect(computeTimeDiff(13 * 7 * 24 * 60 * 60 * 1000, Infinity, "en", true).humanDiff).toEqual(
      "91 days"
    );
  });

  test.skip("2 unit outputs", () => {
    expect(computeTimeDiff(7698978).humanDiff).toEqual("2 hours and 8 minutes");
    expect(computeTimeDiff(180000000).humanDiff).toEqual("2 days and 2 hours");
    expect(computeTimeDiff(86940000, Infinity, "en", true).humanDiff).toEqual("1 day & 9 mins");
    expect(computeTimeDiff(209939232).humanDiff).toEqual("2 days and 10 hours");
    // expect(computeTimeDiff(3289329032, Infinity, "en", true).humanDiff).toEqual("5 wks & 3 days");
    expect(computeTimeDiff(3289329032, Infinity, "en", true).humanDiff).toEqual("38 days");
  });

  test.skip("3 unit outputs", () => {
    expect(computeTimeDiff(160000000).humanDiff).toEqual("1 day, 20 hours and 26 minutes");
    // expect(computeTimeDiff(904839232).humanDiff).toEqual("1 week, 3 days and 11 hours");
  });
});

describe("Compute nextUpdate", () => {
  test("final update", () => {
    expect(computeTimeDiff(-1000).timeLeftForNextUpdate).toEqual(0);
    expect(computeTimeDiff(0, Infinity, "en", true).timeLeftForNextUpdate).toEqual(0);
    expect(computeTimeDiff(100).timeLeftForNextUpdate).toEqual(0);
    expect(computeTimeDiff(1000, Infinity, "en", true).timeLeftForNextUpdate).toEqual(0);
  });

  test("when some time is left", () => {
    expect(computeTimeDiff(3540000, Infinity, "en", true).timeLeftForNextUpdate).toEqual(3480000);
    expect(computeTimeDiff(3540061, Infinity, "en", true).timeLeftForNextUpdate).toEqual(3480000);
  });
});
