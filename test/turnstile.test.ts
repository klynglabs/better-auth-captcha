import { afterEach, describe, expect, spyOn, test } from "bun:test";

import { turnstile } from "../src/providers/turnstile.ts";

type RenderParams = Parameters<NonNullable<Window["turnstile"]>["render"]>[1];

function installFakeTurnstile() {
  const widget: { params?: RenderParams; response?: string; renders: number } = { renders: 0 };

  window.turnstile = {
    render: (_container, params) => {
      widget.renders += 1;
      widget.params = params;
      return "widget-1";
    },
    reset: () => {
      widget.response = undefined;
    },
    getResponse: () => widget.response,
    isExpired: () => false,
  };

  return {
    widget,
    solve: (token: string) => {
      widget.response = token;
      widget.params?.callback(token);
    },
    fail: (code: string) => widget.params?.["error-callback"](code),
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  window.turnstile = undefined;
});

describe("turnstile", () => {
  test("renders one widget no matter how often preload runs", async () => {
    const fake = installFakeTurnstile();
    const provider = turnstile({ siteKey: "site-key" });

    provider.preload();
    provider.preload();
    await flush();

    expect(fake.widget.renders).toBe(1);
    expect(fake.widget.params?.sitekey).toBe("site-key");
  });

  test("hands out a ready token and starts solving the next one", async () => {
    const fake = installFakeTurnstile();
    const provider = turnstile({ siteKey: "site-key" });

    provider.preload();
    await flush();
    fake.solve("first");

    expect(await provider.getToken()).toBe("first");
    expect(fake.widget.response).toBeUndefined();
  });

  test("waits for the next token when none is ready", async () => {
    const fake = installFakeTurnstile();
    const provider = turnstile({ siteKey: "site-key" });

    const token = provider.getToken();
    await flush();
    fake.solve("late");

    expect(await token).toBe("late");
  });

  test("gives concurrent requests different tokens", async () => {
    const fake = installFakeTurnstile();
    const provider = turnstile({ siteKey: "site-key" });

    const first = provider.getToken();
    const second = provider.getToken();
    await flush();
    fake.solve("a");
    fake.solve("b");

    expect(await first).toBe("a");
    expect(await second).toBe("b");
  });

  test("returns an empty token after an error instead of hanging, then recovers", async () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    const fake = installFakeTurnstile();
    const provider = turnstile({ siteKey: "site-key" });

    const pending = provider.getToken();
    await flush();
    fake.fail("600010");

    expect(await pending).toBe("");
    expect(await provider.getToken()).toBe("");
    expect(warn).toHaveBeenCalledWith("[better-auth-captcha] Turnstile error 600010");

    fake.solve("recovered");
    expect(await provider.getToken()).toBe("recovered");
    warn.mockRestore();
  });
});
