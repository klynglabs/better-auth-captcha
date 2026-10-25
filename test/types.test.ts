import { expect, test } from "bun:test";

import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

import { captchaClient } from "../src/index.ts";
import { turnstile } from "../src/turnstile.ts";

test("keeps the inferred API of other plugins", () => {
  const authClient = createAuthClient({
    baseURL: "https://api.example.com",
    plugins: [usernameClient(), captchaClient({ provider: turnstile({ siteKey: "site-key" }) })],
  });

  expect(authClient.signIn.username).toBeFunction();
  expect(authClient.signIn.email).toBeFunction();
  expect(authClient.captcha.preload).toBeFunction();
});
