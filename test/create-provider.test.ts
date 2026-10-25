import { describe, expect, spyOn, test } from "bun:test";

import { createProvider } from "../src/providers/create-provider.ts";

describe("createProvider", () => {
  test("retries mounting after a failed load", async () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    let mounts = 0;
    const provider = createProvider({
      name: "Fake",
      mount: async () => {
        mounts += 1;
        if (mounts === 1) throw new Error("network");
        return "widget";
      },
      execute: async () => "token",
    });

    expect(await provider.getToken()).toBe("");
    expect(await provider.getToken()).toBe("token");
    expect(await provider.getToken()).toBe("token");
    expect(mounts).toBe(2);
    warn.mockRestore();
  });
});
