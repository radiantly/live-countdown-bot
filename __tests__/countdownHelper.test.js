import { parseInline } from "../modules/countdownHelper";

describe("Parse inline", () => {
  test("no inline countdowns", () => {
    expect(parseInline()).toBeNull();
    expect(parseInline("heya people!!")).toBeNull();
    expect(parseInline("!!coutdown hiSd!")).toBeNull();
  });

  test("Parse countdowns", () => {
    expect(parseInline("!!countdown 12PM!")).toEqual({
      commands: ["12pm"],
      parts: ["", ""],
    });
  });
});
