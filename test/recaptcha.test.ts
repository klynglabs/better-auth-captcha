import { afterEach, describe, expect, spyOn, test } from "bun:test";

import { recaptcha } from "../src/providers/recaptcha.ts";

function installFakeRecaptcha(execute: () => Promise<string>) {
  const calls: Array<{ siteKey: string; action: string }> = [];

  window.grecaptcha = {
    ready: (callback) => callback(),
    execute: (siteKey, { action }) => {
      calls.push({ siteKey, action });
      return execute();
    },
  };

  return calls;
}

afterEach(() => {
  window.grecaptcha = undefined;
});

describe("recaptcha", () => {
  test("executes a fresh token for every request", async () => {
    let count = 0;
    const calls = installFakeRecaptcha(async () => `token-${++count}`);
    const provider = recaptcha({ siteKey: "site-key" });

    expect(await provider.getToken()).toBe("token-1");
    expect(await provider.getToken()).toBe("token-2");
    expect(calls).toEqual([
      { siteKey: "site-key", action: "submit" },
      { siteKey: "site-key", action: "submit" },
    ]);
  });

  test("uses the configured action", async () => {
    const calls = installFakeRecaptcha(async () => "token");
    const provider = recaptcha({ siteKey: "site-key", action: "login" });

    await provider.getToken();

    expect(calls[0]?.action).toBe("login");
  });

  test("returns an empty token when execute fails instead of throwing", async () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    installFakeRecaptcha(() => Promise.reject(new Error("network")));
    const provider = recaptcha({ siteKey: "site-key" });

    expect(await provider.getToken()).toBe("");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
