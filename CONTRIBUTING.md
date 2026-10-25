# Contributing to better-auth-captcha

Thanks for helping out. This guide covers setup, the checks your change needs to pass, and how to open a pull request.

## Setup

1. Fork the repository and clone it:

   ```sh
   git clone https://github.com/your-username/better-auth-captcha.git
   cd better-auth-captcha
   ```

2. Install [Bun](https://bun.sh). The version is pinned in `packageManager` in `package.json`.

3. Install dependencies:

   ```sh
   bun install
   ```

4. Build:

   ```sh
   bun run build
   ```

Use Bun for everything. Don't commit a `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.

## Checks

Run everything CI runs before you open a pull request:

```sh
bun run check
bun run build
```

`check` runs formatting, linting, type checking, and tests. You can run each one on its own:

| Script              | What it does             |
| ------------------- | ------------------------ |
| `bun run format`    | Formats with oxfmt       |
| `bun run lint`      | Lints with oxlint        |
| `bun run lint:fix`  | Fixes lint issues it can |
| `bun run typecheck` | Type checks with `tsc`   |
| `bun test`          | Runs the tests           |
| `bun run dev`       | Rebuilds on change       |

## Tests

Bug fixes and new features need tests. Tests live in `test/` and run with `bun test` in a [happy-dom](https://github.com/capricorn86/happy-dom) environment.

Tests don't load real captcha scripts. Fake the provider's global API instead, as `test/captchafox.test.ts` does with `window.captchafox`.

To run one file:

```sh
bun test test/turnstile.test.ts
```

## Adding a provider

A provider can be added when:

- better-auth's [server captcha plugin](https://better-auth.com/docs/plugins/captcha) supports it. This package is only the client half.
- It can produce a token without a click. The widget is rendered off-screen, so checkbox-only captchas can't be solved.

Open an issue first to confirm it fits. Then:

1. Add `src/providers/<name>.ts`. Build it with `createProvider` from `src/providers/create-provider.ts`, which handles retries and queuing.
2. Add an entry in `tsdown.config.ts` and an export in `package.json`.
3. Add `test/<name>.test.ts`.
4. Add a section to `README.md` with the server provider name and the client setup.

## Issues

Search existing issues before opening a new one.

- **Bugs:** include the provider, your better-auth version, steps to reproduce, and what you expected. A minimal reproduction gets a fix fastest.
- **Features:** describe the problem before the solution. Agree on scope in the issue before writing code.
- **Security:** don't open a public issue. Report it through [GitHub Security Advisories](https://github.com/klynglabs/better-auth-captcha/security/advisories/new).

## Pull requests

Discuss new features and large changes in an issue first. Pull requests that skip this, or that are too broad to review, may be closed.

### Titles

Pull requests are squash merged, so the title becomes the commit on `main`. Use [Conventional Commits](https://www.conventionalcommits.org/), with the provider as the scope when there is one:

```text
feat: add a provider
fix(turnstile): stop waiting forever when a challenge times out
docs: note that Vercel BotID needs Vercel's client
```

Start the summary with a lowercase letter. Add `!` for breaking changes, e.g. `feat!: rename the endpoints option`.

### Changesets

Changes to `src/` need a changeset. Run:

```sh
bun run changeset
```

Pick the bump type, write a description, and commit the generated file with your pull request.

Pick the bump type by user impact. The package is before 1.0, so:

- **`patch`** for bug fixes and changes users don't need to act on.
- **`minor`** for new features and breaking changes.

Write the description for people reading the changelog:

- Say what changed for users, not how the code changed.
- Describe the symptom that's fixed, not the internal cause.
- Skip commit prefixes like `fix:`.

See `CHANGELOG.md` for examples. If you're unsure whether you need one, a maintainer will add it before merging.

### Description

- Say what changed and why.
- Link related issues, e.g. `Closes #12`.
- List any breaking changes.

## AI-assisted contributions

AI-assisted code and issues are welcome if they solve a real problem. They have to meet the same bar as any other contribution: tests, docs, and passing checks. Review what you submit and understand it well enough to discuss it.
