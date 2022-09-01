import got from "got";

export const parseTimeString = async (text, timezone) => {
  try {
    return await got
      .post("unix:/tmp/parsedateserver.sock:/", {
        enableUnixSockets: true,
        json: { text, timezone },
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
