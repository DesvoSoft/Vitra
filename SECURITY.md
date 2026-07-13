# Security Policy

## Supported Versions

Vitra CSS is a small, actively-maintained open-source project. Security fixes are made against the latest released version only.

| Version | Supported          |
| ------- | ------------------ |
| 1.7.x   | :white_check_mark: |
| < 1.7   | :x:                |

## Reporting a Vulnerability

Vitra CSS does not run a bug bounty program. If you believe you've found a security vulnerability (for example, an XSS vector in the JS modules, a supply-chain issue in the build pipeline, or a way the CSS/JS could be abused to exfiltrate data), please report it privately rather than opening a public issue.

Preferred: open a [GitHub Security Advisory](https://github.com/desvosoft/vitra-css/security/advisories/new) for this repository. This lets us discuss and fix the issue privately before it's disclosed.

Alternative: email **desvox23@gmail.com** with a description of the issue, steps to reproduce, and any proof-of-concept code.

Please include:

- The affected version(s) or commit.
- A clear description of the vulnerability and its potential impact.
- Steps to reproduce, or a minimal repro case.

## Response Expectations

This is a small OSS project maintained on a best-effort basis — there is no formal SLA. In practice:

- We aim to acknowledge new reports within a few days.
- Confirmed vulnerabilities will be fixed and released as soon as reasonably possible, prioritized by severity.
- We'll credit reporters in the release notes / `CHANGELOG.md`, unless you'd prefer to remain anonymous.

## Scope

Vitra CSS is a CSS framework with optional vanilla JS (theme switching, particles, modals, tooltips, toasts, dropdowns, spotlight hover). It has zero runtime dependencies and does not handle authentication, user data, or server-side logic — so most reports will relate to client-side issues (e.g., unsafe DOM insertion, `localStorage` misuse) or the build/release pipeline (e.g., compromised dependencies, CDN artifact tampering).
