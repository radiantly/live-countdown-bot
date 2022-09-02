import got from "got";
import { getUserData, setUserData } from "./sqlite3.js";

// Parses timestring but also saves and retrieves user's history/preference
export const parseUserTimeString = async (user, text, timezone, store = false) => {
  const default_timezone = getUserData(user.id)?.lastTimezone || "UTC";

  const result = await parseTimeString(text, timezone, default_timezone);
  if (store && result?.timezone) {
    setUserData(user.id, {
      lastTimestamp: text,
      lastText: result.timezone,
    });
  }

  return result;
};

const parseTimeString = async (text, timezone, default_timezone) => {
  try {
    return await got
      .post("unix:/tmp/parsedateserver.sock:/", {
        enableUnixSockets: true,
        json: { text, timezone, default_timezone },
      })
      .json();
  } catch (exception) {
    console.error(exception);
    return {
      error:
        "Internal server error! Please wait for some time or discuss this in the support server",
    };
  }
};
