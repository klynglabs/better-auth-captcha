# hCaptcha

Server:

```ts
import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    captcha({
      provider: "hcaptcha",
      secretKey: env.HCAPTCHA_SECRET_KEY,
    }),
  ],
});
```

Client:

```ts
import { createAuthClient } from "better-auth/react";
import { captchaClient } from "better-auth-captcha";
import { hcaptcha } from "better-auth-captcha/hcaptcha";

export const authClient = createAuthClient({
  plugins: [
    captchaClient({
      provider: hcaptcha({ siteKey: env.HCAPTCHA_SITE_KEY }),
    }),
  ],
});
```

It runs in invisible mode, so most users see nothing, but hCaptcha may show a challenge when a protected request is sent. hCaptcha asks you to [disclose it on the page](https://docs.hcaptcha.com/invisible) when it runs invisibly.
