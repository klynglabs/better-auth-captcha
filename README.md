# better-auth-captcha

[![npm](https://img.shields.io/npm/v/better-auth-captcha?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/better-auth-captcha)
[![CI](https://img.shields.io/github/actions/workflow/status/klynglabs/better-auth-captcha/ci.yml?branch=main&style=flat&colorA=000000&colorB=000000)](https://github.com/klynglabs/better-auth-captcha/actions/workflows/ci.yml)

The client half of [better-auth's captcha plugin](https://better-auth.com/docs/plugins/captcha). It solves the captcha in the background and attaches the token to protected requests, so your forms don't change.

## Install

```sh
npm install better-auth-captcha
```

ESM only. Requires `better-auth` 1.7+.

## Usage

Server, using better-auth's own plugin:

```ts
import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    }),
  ],
});
```

Client:

```ts
import { createAuthClient } from "better-auth/react";
import { captchaClient } from "better-auth-captcha";
import { turnstile } from "better-auth-captcha/turnstile";

export const authClient = createAuthClient({
  plugins: [
    captchaClient({
      provider: turnstile({ siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY! }),
    }),
  ],
});
```

By default, the first protected request waits for the captcha to solve. To have a token ready before the user submits, call `preload()` on pages with a protected form:

```ts
authClient.captcha.preload();
```

It does nothing on the server, and calling it more than once is fine.

## Providers

Each provider has setup steps of its own, so read its page before you ship.

| Provider                                            | Server `provider`        | Client import                    |
| --------------------------------------------------- | ------------------------ | -------------------------------- |
| [Cloudflare Turnstile](docs/providers/turnstile.md) | `"cloudflare-turnstile"` | `better-auth-captcha/turnstile`  |
| [Google reCAPTCHA v3](docs/providers/recaptcha.md)  | `"google-recaptcha"`     | `better-auth-captcha/recaptcha`  |
| [hCaptcha](docs/providers/hcaptcha.md)              | `"hcaptcha"`             | `better-auth-captcha/hcaptcha`   |
| [CaptchaFox](docs/providers/captchafox.md)          | `"captchafox"`           | `better-auth-captcha/captchafox` |

better-auth's Vercel BotID provider doesn't use a token, so use Vercel's [`botid`](https://vercel.com/docs/botid) client for it instead.

## Options

| Option      | Default                                                           | Description                                            |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| `provider`  | required                                                          | Where tokens come from, e.g. `turnstile({ siteKey })`. |
| `endpoints` | `["/sign-up/email", "/sign-in/email", "/request-password-reset"]` | Paths that get a token. Match the server plugin.       |

## License

MIT
