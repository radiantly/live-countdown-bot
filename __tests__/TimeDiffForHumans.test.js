import { timeDiffForHumans } from "../modules/timeDiffForHumans.js";

describe("Time diff for humans", () => {
  test("diff < 1 min", () => {
    expect(timeDiffForHumans(100)).toEqual("Less than a minute");
    expect(timeDiffForHumans(1000, true)).toEqual("< 1min");
  });

  test("minutes", () => {
    expect(timeDiffForHumans(10 * 60 * 1000)).toEqual("10 minutes");
    expect(timeDiffForHumans(9 * 60 * 1000, true)).toEqual("9 mins");
  });

  test("hours", () => {
    expect(timeDiffForHumans(2 * 60 * 60 * 1000)).toEqual("2 hours");
    expect(timeDiffForHumans(12 * 60 * 60 * 1000, true)).toEqual("12 hrs");
  });

  test("days", () => {
    expect(timeDiffForHumans(9 * 24 * 60 * 60 * 1000)).toEqual("9 days");
    expect(timeDiffForHumans(14 * 24 * 60 * 60 * 1000, true)).toEqual("14 days");
  });

  test("2 unit outputs", () => {
    expect(timeDiffForHumans(7698978)).toEqual("2 hours and 8 minutes");
    expect(timeDiffForHumans(180000000)).toEqual("2 days and 2 hours");
    expect(timeDiffForHumans(86940000, true)).toEqual("1 day & 9 mins");
  });

  test("3 unit outputs", () => {
    expect(timeDiffForHumans(904839232)).toEqual("10 days, 11 hours and 20 minutes");
    expect(timeDiffForHumans(3289329032, true)).toEqual("38 days, 1 hr & 42 mins");
  });
});
