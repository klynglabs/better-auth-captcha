# Cloudflare Turnstile

Server:

```ts
import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: env.TURNSTILE_SECRET_KEY,
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
      provider: turnstile({ siteKey: env.TURNSTILE_SITE_KEY }),
    }),
  ],
});
```

Create the Turnstile widget in **Invisible** mode. The widget is rendered off-screen, so a Managed widget that asks for a click can't be solved, and its requests get an empty token.
