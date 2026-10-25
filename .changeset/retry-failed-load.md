---
"better-auth-captcha": patch
---

Retry loading the captcha after a failed load. Previously one failed script load returned an empty token for every request until the page reloaded. reCAPTCHA and Turnstile now handle one token request at a time, like hCaptcha and CaptchaFox.
