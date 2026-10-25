---
"better-auth-captcha": patch
---

Return an empty token when a Turnstile challenge times out or the browser is unsupported. Previously the request waited forever, for example when a Managed widget needed a click it could not get.
