# Atelier UI

[![Version](https://img.shields.io/npm/v/atelier-ui?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/atelier-ui)
[![GitHub stars](https://img.shields.io/github/stars/whatisjery/atelier-ui?style=flat&colorA=000000&colorB=000000)](https://github.com/whatisjery/atelier-ui/stargazers)
[![License](https://img.shields.io/badge/License-MIT-000000?style=flat&colorA=000000&colorB=000000)](https://github.com/whatisjery/atelier-ui/blob/main/LICENSE.md)

<a href="https://atelier-ui.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/images/og_img_dark.jpg" />
    <source media="(prefers-color-scheme: light)" srcset="./public/images/og_img_light.jpg" />
    <img style="max-width: 100%;" src="./public/images/og_img_light.jpg" alt="Atelier UI" />
  </picture>
</a>


## 🎨 What is Atelier UI?

Atelier (French for workshop) is a growing library of fully customizable React animated components
and tooling that help developers create polished, interactive user experiences with ease.

## ✨ Features

- **It's your code.** Components are copied into your project, not installed as a
  package, so they remain fully customizable.
- **Ready-made effects.** Text animations, cursor interactions, scroll effects,
  page transitions, and animated backgrounds.
- **A real WebGL system.** Components share a single canvas and stay aligned to
  the DOM.
- **Built for React 19 + Tailwind v4.** Works with Next.js, Vite, or any React
  setup.

## ⚙️ Install

Add any component by name:

```bash
npx atelier-ui add fluid-distortion
```

This copies the source into your project, pulls in anything shared, and installs
the dependencies it needs.

## 🔍 How it works

Most components are self-contained: copy the file, use it, customize it.

WebGL components work differently. They share one canvas (wrap your app in the
provider once), then you write them as normal elements and the library keeps
each one aligned to its spot on the page as it scrolls and resizes:

- **Primitives** wrap a real DOM element (image, video, text), so the page stays
  accessible.
- **Scenes** own a camera and render into a tracked area, like the sphere
  gallery.

## Docs

Browse every component with live previews at
[atelier-ui.com/docs](https://atelier-ui.com/docs).

## Contributing

See the [contribution guide](https://atelier-ui.com/docs/getting-started/contribution).

## License

[MIT](LICENSE.md).
