# Google reCAPTCHA v3

Server:

```ts
captcha({
  provider: "google-recaptcha",
  secretKey: process.env.RECAPTCHA_SECRET_KEY!,
});
```

Client:

```ts
import { recaptcha } from "better-auth-captcha/recaptcha";

captchaClient({
  provider: recaptcha({ siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY! }),
});
```

Tokens are sent with the action `"submit"`. If you set `expectedAction` on the server, pass the same value as `recaptcha({ siteKey, action })`.

reCAPTCHA v2 is not supported, since its checkbox needs a click.
