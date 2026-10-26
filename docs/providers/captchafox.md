# CaptchaFox

Server:

```ts
captcha({
  provider: "captchafox",
  secretKey: env.CAPTCHAFOX_SECRET_KEY,
});
```

Client:

```ts
import { captchafox } from "better-auth-captcha/captchafox";

captchaClient({
  provider: captchafox({ siteKey: env.CAPTCHAFOX_SITE_KEY }),
});
```

It runs in hidden mode, so most users see nothing, but CaptchaFox may show a challenge when a protected request is sent. CaptchaFox asks you to [disclose it on the page](https://docs.captchafox.com/en/hidden-mode) when it runs hidden.
