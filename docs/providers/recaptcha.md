# Google reCAPTCHA v3

Server:

```ts
import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    captcha({
      provider: "google-recaptcha",
      secretKey: env.RECAPTCHA_SECRET_KEY,
    }),
  ],
});
```

Client:

```ts
import { createAuthClient } from "better-auth/react";
import { captchaClient } from "better-auth-captcha";
import { recaptcha } from "better-auth-captcha/recaptcha";

export const authClient = createAuthClient({
  plugins: [
    captchaClient({
      provider: recaptcha({ siteKey: env.RECAPTCHA_SITE_KEY }),
    }),
  ],
});
```

Tokens are sent with the action `"submit"`. If you set `expectedAction` on the server, pass the same value as `recaptcha({ siteKey, action })`.

reCAPTCHA v2 is not supported, since its checkbox needs a click.
