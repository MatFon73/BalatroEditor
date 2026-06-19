# Contributing to BalatroEditor

First off, thank you for considering contributing to BalatroEditor. This project exists thanks to the Balatro community, and every contribution — whether a bug report, a feature suggestion, a pull request, or a discussion — makes it better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We Value](#what-we-value)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Guide](#development-guide)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project adheres to a **[Code of Conduct](CODE_OF_CONDUCT.md)** that all contributors, maintainers, and community members are expected to follow. By participating, you agree to uphold these standards.

## What We Value

- **Respect over agreement.** Disagreement is healthy. Personal attacks are not.
- **Curiosity over assumptions.** Ask questions before judging. Assume good intent.
- **Learning over knowing.** Everyone — regardless of experience — has something to teach and something to learn.
- **Inclusion over exclusivity.** BalatroEditor welcomes contributors of all skill levels, backgrounds, and experience.
- **No judgment, no AI demonization.** You will not be judged for your skill level, the questions you ask, the mistakes you make, or the tools you use (including AI assistants). Likewise, do not judge others. Critique code, not people. Engage with ideas, not identities. Do not shame, mock, or dismiss anyone for using — or not using — AI, frameworks, or specific approaches.

## Getting Started

1. **Read the [README](../README.MD)** — it covers the project structure, stack, and how to run the editor locally.
2. **Check the [AGENTS.md](../AGENTS.md)** — developer conventions and architecture notes.
3. **Browse open [issues](https://github.com/MatFon73/BalatroEditor/issues)** — find something that interests you.
4. **No build step required.** BalatroEditor is a vanilla JS SPA. Open `index.html` in a browser and you're ready to go.

### Prerequisites

- A modern browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control

## How to Contribute

### Reporting Bugs

1. **Search existing issues** — someone may have already reported it.
2. **Use the [Bug Report template](../.github/ISSUE_TEMPLATE/bug_report.md)** — it helps us understand the problem quickly.
3. **Include reproduction steps** — a clear sequence of actions that triggers the bug.
4. **Include environment details** — browser, OS, and Balatro version if relevant.

### Suggesting Features

1. **Explain the use case** — what problem does this solve? Who benefits?
2. **Describe the desired behavior** — be specific about what you expect to happen.
3. **Consider scope** — small, focused features are more likely to be reviewed quickly.

### Submitting Code Changes

1. Fork the repository.
2. Create a feature branch from `main`.
3. Make your changes following our [Style Guidelines](#style-guidelines).
4. Test your changes by opening `index.html` in a browser.
5. Open a pull request using the [PR template](../.github/PULL_REQUEST_TEMPLATE.md).

## Development Guide

### Stack Overview

- **Zero-dependency vanilla JS SPA** — no framework, no build step, no bundler, no package.json.
- External CDN deps: Font Awesome 7.1, Inter font, Pako 2.1.0.
- State is global and mutable (`metaData`, `profileData`) — no data layer.
- Rendering is imperative via `innerHTML` — no vdom, no diffing.

### Key Files

| File | Role |
|---|---|
| `public/js/jkr-converter.js` | Lua parser + deflate/inflate Raw (pako) |
| `public/js/utils.js` | Notification singleton, `formatName`, `exportBlob`, `debounce` |
| `public/js/image-loader.js` | URL chain fallback + localStorage cache |
| `public/js/meta.js` | Collection view |
| `public/js/profile.js` | Profile stats editor |
| `public/js/save-editor.js` | Save game editor |
| `public/js/translations.js` | i18n system (EN/ES) |
| `public/css/style.css` | Full design system via CSS custom properties |

### Before You Code

- **Open an issue first** for non-trivial changes — this avoids duplicate work and gets early feedback.
- **Keep changes focused** — one feature or fix per pull request.
- **Respect existing patterns** — consistency matters more than personal preference in established projects.

## Pull Request Process

1. Ensure your branch is based on `main`.
2. Update the README.MD if your change affects usage or installation.
3. Update translations in `public/js/translations.js` if your change adds or modifies user-facing text.
4. Test manually by opening `index.html` in a browser.
5. Keep the PR diff as small as possible — avoid unrelated formatting changes.
6. A maintainer will review your code. Feedback is about the code, not about you.

## Issue Guidelines

When creating an issue:

- **One issue per topic** — don't combine unrelated bugs or features.
- **Use the appropriate template** — bug report or feature request.
- **Be specific** — vague reports are hard to act on.
- **Search first** — your question may already have an answer.

## Style Guidelines

### JavaScript

- **ES6+ syntax** — use `const`/`let`, arrow functions, template literals, destructuring.
- **Descriptive names** — `currentCategory` not `curCat`.
- **Comments for "why"** — the code shows "what" and "how", comments explain "why".
- **No semicolons** — the project convention omits them.
- **Global state** is accessed through `window` globals (`metaData`, `profileData`, `currentCategory`, etc.).

### CSS

- **Use CSS custom properties** defined in `style.css` — don't hardcode colors, spacing, or typography.
- **Follow the existing naming conventions** in the stylesheet.
- **Mobile-first** — design for small screens first, then add media query overrides.

### Commits

- Write clear, concise commit messages in English.
- Use the imperative mood: "Fix export guard race condition", not "Fixed" or "Fixes".
- Reference issue numbers when applicable: `Closes #42`.

## Questions?

If you're unsure about anything, open a [Discussion](https://github.com/MatFon73/BalatroEditor/discussions) or ask in the issue thread. There are no stupid questions — only unasked ones.

---

**Remember:** This is a community project built for fun. Be kind, be helpful, and enjoy the process.
