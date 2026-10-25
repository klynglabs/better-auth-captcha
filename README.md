# better-auth-captcha

[![npm](https://img.shields.io/npm/v/better-auth-captcha?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/better-auth-captcha)
[![CI](https://img.shields.io/github/actions/workflow/status/klynglabs/better-auth-captcha/ci.yml?branch=main&style=flat&colorA=000000&colorB=000000)](https://github.com/klynglabs/better-auth-captcha/actions/workflows/ci.yml)

The client half of [better-auth's captcha plugin](https://better-auth.com/docs/plugins/captcha). It solves the captcha in the background and attaches the token to protected requests, so your forms don't change.

> [!NOTE]
> Supports Cloudflare Turnstile, Google reCAPTCHA v3, hCaptcha, and CaptchaFox. better-auth's Vercel BotID provider doesn't use a token, so use Vercel's [`botid`](https://vercel.com/docs/botid) client for it instead.

## Install

```sh
npm install better-auth-captcha
```

ESM only. Requires `better-auth` 1.7+.

## Usage

Server, using better-auth's own plugin:

```ts
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

Create the Turnstile widget in **Invisible** mode. The widget is rendered off-screen, so a Managed widget that asks for a click can't be solved, and its requests get an empty token.

By default, the first protected request waits for the captcha to solve. To have a token ready before the user submits, call `preload()` on pages with a protected form:

```ts
authClient.captcha.preload();
```

It does nothing on the server, and calling it more than once is fine.

### Google reCAPTCHA v3

Use `provider: "google-recaptcha"` on the server, and on the client:

```ts
import { recaptcha } from "better-auth-captcha/recaptcha";

captchaClient({
  provider: recaptcha({ siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY! }),
});
```

Tokens are sent with the action `"submit"`. If you set `expectedAction` on the server, pass the same value as `recaptcha({ siteKey, action })`. reCAPTCHA v2 is not supported, since its checkbox needs a click.

### hCaptcha

Use `provider: "hcaptcha"` on the server, and on the client:

```ts
import { hcaptcha } from "better-auth-captcha/hcaptcha";

captchaClient({
  provider: hcaptcha({ siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY! }),
});
```

It runs in invisible mode, so most users see nothing, but hCaptcha may show a challenge when a protected request is sent. hCaptcha asks you to [disclose it on the page](https://docs.hcaptcha.com/invisible) when it runs invisibly.

### CaptchaFox

Use `provider: "captchafox"` on the server, and on the client:

```ts
import { captchafox } from "better-auth-captcha/captchafox";

captchaClient({
  provider: captchafox({ siteKey: process.env.NEXT_PUBLIC_CAPTCHAFOX_SITE_KEY! }),
});
```

It runs in hidden mode, so most users see nothing, but CaptchaFox may show a challenge when a protected request is sent. CaptchaFox asks you to [disclose it on the page](https://docs.captchafox.com/en/hidden-mode) when it runs hidden.

## Options

| Option      | Default                                                           | Description                                            |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| `provider`  | required                                                          | Where tokens come from, e.g. `turnstile({ siteKey })`. |
| `endpoints` | `["/sign-up/email", "/sign-in/email", "/request-password-reset"]` | Paths that get a token. Match the server plugin.       |

## License

MIT
