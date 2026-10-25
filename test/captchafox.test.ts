import { afterEach, describe, expect, spyOn, test } from "bun:test";

import { captchafox } from "../src/providers/captchafox.ts";

function installFakeCaptchafox(execute: () => Promise<string>) {
  const widget: { params?: { sitekey: string; mode: string }; renders: number; resets: number } = {
    renders: 0,
    resets: 0,
  };

  window.captchafox = {
    render: (_container, params) => {
      widget.renders += 1;
      widget.params = params;
      return "widget-1";
    },
    execute,
    reset: () => {
      widget.resets += 1;
    },
  };

  return widget;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  window.captchafox = undefined;
});

describe("captchafox", () => {
  test("renders one hidden widget no matter how often preload runs", async () => {
    const widget = installFakeCaptchafox(async () => "token");
    const provider = captchafox({ siteKey: "site-key" });

    provider.preload();
    provider.preload();
    await flush();

    expect(widget.renders).toBe(1);
    expect(widget.params).toEqual({ sitekey: "site-key", mode: "hidden" });
  });

  test("executes a fresh token for every request and resets after each", async () => {
    let count = 0;
    const widget = installFakeCaptchafox(async () => `token-${++count}`);
    const provider = captchafox({ siteKey: "site-key" });

    expect(await provider.getToken()).toBe("token-1");
    expect(await provider.getToken()).toBe("token-2");
    expect(widget.resets).toBe(2);
  });

  test("runs concurrent requests one at a time", async () => {
    const running = { now: 0, max: 0, count: 0 };
    installFakeCaptchafox(async () => {
      running.now += 1;
      running.max = Math.max(running.max, running.now);
      await flush();
      running.now -= 1;
      return `token-${++running.count}`;
    });
    const provider = captchafox({ siteKey: "site-key" });

    expect(await Promise.all([provider.getToken(), provider.getToken()])).toEqual([
      "token-1",
      "token-2",
    ]);
    expect(running.max).toBe(1);
  });

  test("returns an empty token when execute fails, then recovers", async () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    let calls = 0;
    const widget = installFakeCaptchafox(async () => {
      calls += 1;
      if (calls === 1) throw new Error("challenge-aborted");
      return "token";
    });
    const provider = captchafox({ siteKey: "site-key" });

    expect(await provider.getToken()).toBe("");
    expect(await provider.getToken()).toBe("token");
    expect(widget.resets).toBe(2);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
