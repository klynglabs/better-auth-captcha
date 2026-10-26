# Cloudflare Turnstile

Server:

```ts
captcha({
  provider: "cloudflare-turnstile",
  secretKey: process.env.TURNSTILE_SECRET_KEY!,
});
```

Client:

```ts
import { turnstile } from "better-auth-captcha/turnstile";

captchaClient({
  provider: turnstile({ siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY! }),
});
```

Create the Turnstile widget in **Invisible** mode. The widget is rendered off-screen, so a Managed widget that asks for a click can't be solved, and its requests get an empty token.
