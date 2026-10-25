# better-auth-captcha

## 0.5.0

### Minor Changes

- 5b84afc: Type the captcha plugin's error codes on the client: `authClient.$ERROR_CODES` now includes `MISSING_RESPONSE`, `VERIFICATION_FAILED` and `UNKNOWN_ERROR`.

### Patch Changes

- cd877d3: Type the CaptchaFox widget ID as a number, matching the CaptchaFox docs. No runtime change.
- 8f4fe9f: Match `endpoints` the way the server plugin does: the path after the base path must match exactly, or through `*` and `**` wildcards. Wildcard endpoints such as `/sign-in/*` now get a token, and a suffix such as `/email` no longer matches `/sign-in/email`.
- 0f91673: Retry loading the captcha after a failed load. Previously one failed script load returned an empty token for every request until the page reloaded. reCAPTCHA and Turnstile now handle one token request at a time, like hCaptcha and CaptchaFox.
- d4b8c70: Return an empty token when a Turnstile challenge times out or the browser is unsupported. Previously the request waited forever, for example when a Managed widget needed a click it could not get.

## 0.4.0

### Minor Changes

- 81b69d8: Add a CaptchaFox provider: `captchafox({ siteKey })` from `better-auth-captcha/captchafox`.

## 0.3.0

### Minor Changes

- 6a786db: Add an hCaptcha provider: `hcaptcha({ siteKey })` from `better-auth-captcha/hcaptcha`.

## 0.2.0

### Minor Changes

- 31e5590: Add a Google reCAPTCHA v3 provider: `recaptcha({ siteKey })` from `better-auth-captcha/recaptcha`.

## 0.1.2

### Patch Changes

- 9718a5f: Fix `authClient.signIn` and other plugin APIs disappearing from the client's types when `captchaClient` is added.

## 0.1.1

### Patch Changes

- 3d52b00: Note in the README that the package is ESM only.
