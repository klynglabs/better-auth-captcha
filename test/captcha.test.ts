import { describe, expect, mock, test } from "bun:test";

import type { CaptchaClientPlugin } from "../src/index.ts";
import { captchaClient } from "../src/index.ts";

function getOnRequest(plugin: CaptchaClientPlugin) {
  const onRequest = plugin.fetchPlugins?.[0]?.hooks?.onRequest;

  if (!onRequest) {
    throw new Error("captchaClient registers no onRequest hook");
  }

  return onRequest;
}

function setup(endpoints?: string[]) {
  const provider = { preload: mock(() => {}), getToken: mock(async () => "token") };
  const plugin = captchaClient({ provider, endpoints });
  const onRequest = getOnRequest(plugin);

  async function send(path: string, headers = new Headers()) {
    await onRequest({
      url: `https://api.example.com/api/auth${path}`,
      headers,
      body: undefined,
      method: "POST",
      signal: new AbortController().signal,
    });
    return headers;
  }

  return { plugin, provider, send };
}

describe("captchaClient", () => {
  test("attaches a token to better-auth's default captcha endpoints", async () => {
    const { send } = setup();

    const paths = ["/sign-up/email", "/sign-in/email", "/request-password-reset"];
    const responses = await Promise.all(paths.map((path) => send(path)));

    for (const headers of responses) {
      expect(headers.get("x-captcha-response")).toBe("token");
    }
  });

  test("leaves other endpoints alone", async () => {
    const { send, provider } = setup();

    expect((await send("/get-session")).has("x-captcha-response")).toBe(false);
    expect(provider.getToken).not.toHaveBeenCalled();
  });

  test("keeps a token the caller already set", async () => {
    const { send, provider } = setup();
    const headers = new Headers({ "x-captcha-response": "manual" });

    expect((await send("/sign-in/email", headers)).get("x-captcha-response")).toBe("manual");
    expect(provider.getToken).not.toHaveBeenCalled();
  });

  test("uses custom endpoints instead of the defaults", async () => {
    const { send } = setup(["/sign-in/username"]);

    expect((await send("/sign-in/username")).get("x-captcha-response")).toBe("token");
    expect((await send("/sign-in/email")).has("x-captcha-response")).toBe(false);
  });

  test("exposes preload as an action", () => {
    const { plugin, provider } = setup();

    plugin.getActions().captcha.preload();
    expect(provider.preload).toHaveBeenCalledTimes(1);
  });
});
