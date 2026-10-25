---
"better-auth-captcha": patch
---

Match `endpoints` the way the server plugin does: the path after the base path must match exactly, or through `*` and `**` wildcards. Wildcard endpoints such as `/sign-in/*` now get a token, and a suffix such as `/email` no longer matches `/sign-in/email`.
