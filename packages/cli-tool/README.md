# Atelier UI

[![Version](https://img.shields.io/npm/v/atelier-ui?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/atelier-ui)
[![GitHub stars](https://img.shields.io/github/stars/whatisjery/atelier-ui?style=flat&colorA=000000&colorB=000000)](https://github.com/whatisjery/atelier-ui/stargazers)
[![License](https://img.shields.io/badge/License-MIT-000000?style=flat&colorA=000000&colorB=000000)](https://github.com/whatisjery/atelier-ui/blob/main/LICENSE.md)

<a href="https://atelier-ui.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/whatisjery/atelier-ui/main/public/images/og_img_dark.jpg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/whatisjery/atelier-ui/main/public/images/og_img_light.jpg" />
    <img style="max-width: 100%;" src="https://raw.githubusercontent.com/whatisjery/atelier-ui/main/public/images/og_img_light.jpg" alt="Logo" />
  </picture>
</a>

## About Atelier UI

Atelier means **workshop** in French.

It's a growing collection of React animations and interactive effects, built with React, TypeScript, [Tailwind](https://tailwindcss.com), [Motion](https://motion.dev), and [React Three Fiber](https://r3f.docs.pmnd.rs). Copy the source into your project and own it.

Some are built with WebGL. Two things about those:

- they all render through a single shared canvas, reusing one WebGL context and render loop instead of each effect creating its own
- they build on a primitive that keeps text, images, and video in the DOM, so the page stays accessible and indexable

Feel free to [contribute](https://atelier-ui.com/docs/getting-started/contribution) if you want to get involved.

## What's inside

Effects grouped by what they do, with more added over time:

- **Cursor**: react to the pointer
- **Scroll**: driven by scroll position
- **Text**: animated text that stays readable
- **Transitions**: page and section reveals
- **Backgrounds**: full-screen animated surfaces
- **Primitives**: the building blocks the rest are made from

[Browse them all](https://atelier-ui.com/docs), or start with [Fluid Distortion](https://atelier-ui.com/docs/components/cursor/fluid-distortion).

## CLI

```bash
npx atelier-ui add [component]
```

| Option | Default | Description |
| --- | --- | --- |
| `--path` | `src/components` | Component destination |
| `--shared-path` | `src` | Shared files destination |
| `--registry` | `https://www.atelier-ui.com/api/registry` | Registry URL |
| `--force` | `false` | Overwrite existing files |
| `--no-install` | — | Skip dependency installation |

## License

Licensed under the [MIT License](LICENSE.md).
