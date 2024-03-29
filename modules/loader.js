import { URL } from "url";

let loadId = "0";

export const resolve = async (specifier, context, defaultResolve) => {
  const result = await defaultResolve(specifier, context, defaultResolve);

  const child = new URL(result.url);

  if (
    child.protocol === "nodejs:" ||
    child.protocol === "node:" ||
    child.pathname.includes("/node_modules/") ||
    !child.pathname.includes("/reloadable/")
  ) {
    return result;
  }

  if (child.pathname.includes("/reloadable/index.js")) {
    loadId = child.searchParams.get("loadId");
    console.log(`Setting loadId to ${loadId}`);
  }

  child.searchParams.set("loadId", loadId);

  return {
    url: child.href,
  };
};
