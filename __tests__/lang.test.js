import { t } from "../modules/lang.js";

describe("Time diff for humans", () => {
  test("invalid param", () => {
    expect(t("")).toBeUndefined();
    expect(t("hey", "")).toBeUndefined();
    expect(t("hey", "lang")).toBeUndefined();
  });

  test("normal working", () => {
    expect(t("timeLeft")).toEqual("Time left");
    expect(t("timeLeft", "es")).toEqual("Tiempo restante");
    expect(t("longStrings.hour", "es")).toEqual("hora");
  });

  test("fallback to en if translation not found", () => {
    expect(t("shortStrings.day", "es")).toEqual("day");
  });
});
