---
name: atelier-ui
description: >
    Install and wire Atelier UI components (atelier-ui.com) into a React project:
    shadcn registry setup, the @atelier pro registry and license key, the shared WebGL
    canvas, smooth scroll, and page transitions. Use this skill when adding, moving, or
    removing an Atelier component, when running `npx shadcn add` against @atelier or an
    atelier-ui.com registry URL, and when troubleshooting an installed Atelier component
    that renders nothing, throws a React Compiler or react-hooks lint error, or breaks
    scrolling or page transitions - even when the user names only the effect and never
    says "Atelier", such as a background shader, a cursor or hover effect, a scroll
    effect, a WebGL image, video or text plane, or a page transition.
compatibility: Requires Node.js, network access, and a React 19 project using Tailwind CSS v4, such as Next.js or Vite. Page transitions are the exception and require Next.js 15.3 or later.
metadata:
    version: "1.4.0"
---

# Atelier UI

Atelier UI (atelier-ui.com) is a WebGL and Motion system for React. It covers shader
backgrounds, cursor and hover effects, scroll-driven animation, WebGL image, video and
text planes, 3D galleries, and page transitions for Next.js.

Three things are shared across the catalog instead of living inside each component: one
WebGL canvas every effect draws into, one Lenis smooth scroll driven on Motion's frame
loop, and one page transition system. That is what lets many effects coexist on a
scrolling page without exhausting the browser's WebGL context cap or fighting each other
for the scroll position.

## Finding a component

When the request names an effect rather than a component, search the catalog first. There
is nothing to set up: `@atelier` is in the shadcn registry directory, so the CLI resolves
it before `components.json` has any entry for it.

```sh
npx shadcn@latest search @atelier -q "scroll"
```

That covers all 51 items and writes nothing.

Never run `npx shadcn view` on an Atelier item. It inlines the component's full source, a
thousand lines of shader code for most of them, and tells you nothing the search result
and the `Usage:` markdown don't already cover.

## Paths

Files land in `components/<name>/<name>.tsx`, imported as `@/components/<name>/<name>`.
The path repeats the name, so `@/components/webgl-provider` is wrong and
`@/components/webgl-provider/webgl-provider` is right.

Shared hooks and helpers are the exception: they land at `hooks/` and `lib/`, outside
`components/`. The installed files import them relatively and already resolve. Leave
those imports alone.

A `Props:` line in the prompt holds the preview's props as JSX attributes. Pass them as written.

The add command prints a `Usage:` URL for every item it installs. Fetch it. It returns a
few KB of plain markdown holding the images, the props and the mount, ready to paste.

If no `Usage:` line was printed, the URL is `https://www.atelier-ui.com/r/<name>.md`. Try it
once. A 404 there means the doc is genuinely missing, so fall back to the installed source
and say so in your summary rather than probing for other paths.

Fetch it raw, with `curl` or whatever returns the bytes unchanged. A tool that reads a page
through a model and hands back a summary will drop image URLs and prop values without
saying so, and the result looks fine until it doesn't compile.

Don't reconstruct usage by reading the component source, it's a thousand lines of shader
code and the answer isn't in there. Don't open the `Docs:` URL either, that one is the
rendered page for humans.

## Where to stop

Install the component, wire it up, confirm the project's build passes. That's the whole job.

Don't install a browser driver, a screenshot tool, or anything else to look at the result.
Don't fix lint errors inside the installed files, see the lint section below.
Don't reformat or refactor them either, they're overwritten on the next install.

## Images

Some components take a required array of media, usually `items={[{ src, alt }]}`.
They render nothing when it's empty, so the prop is not optional in practice.

The `Usage:` markdown has working image sources. Use them as written. Don't invent
placeholders, don't generate SVGs, and don't go hunting through the repo for assets.

## Install order

If the add command has already run, the checks below are spent. Skip to Installing, read
the `Usage:` markdown, wire the component up, and run the build. Re-running the
prerequisite and license steps after a successful install verifies nothing.

- [ ] 1. Tailwind CSS v4 present, stop and ask if not
- [ ] 2. `components.json` at the project root, create it if absent
- [ ] 3. Pro or free, from what the prompt says, without looking anything up
- [ ] 4. Pro items only: `ATELIER_PRO_KEY` present, stop and ask if not, then give the `@atelier` entry its license header
- [ ] 5. Run the add command
- [ ] 6. Add the lint override, before anything runs a linter
- [ ] 7. Wire it up, then run the project's build

Steps 1 and 4 are hard stops, never run the add command past a failed one.
The sections below cover each step in this order.

## Prerequisites

**Tailwind CSS v4.** Check for `tailwindcss` in dependencies and `@import "tailwindcss"` in the global stylesheet.

**Missing:** stop. Say the project has no Tailwind, that Atelier components need it to render, and ask whether to install it. Do not install without an answer, it touches the build config and the global stylesheet. On yes, follow https://tailwindcss.com/docs/installation.

**Present:** continue.

**Next.js 15.3 or later, page transitions only.** Every other component runs on any React 19 setup, Next.js or Vite alike. Page transitions are the exception. Check `next` in package.json, and stop and say so if it is absent or older.

**components.json.** Needed at the project root. Create with `npx shadcn@latest init -d` if absent, no need to ask.

## Pro license

Free and pro items install the same way, but a pro one without a key fails with a 401.

Don't look it up. A copied prompt says so: a pro one tells you to install `agent-rules`
first and set up the license, a free one gives you a single add command. Follow what the
prompt says and skip the rest of this section when it says nothing about a license.

With no prompt to go on, install anyway. A pro item without a key fails with a 401 whose
body names the variable, which is cheaper than a lookup on every install. Handle it then.

Check for the key first. The CLI reads `.env.local`, `.env.development.local`, `.env.development`, `.env`:

```sh
grep -l "ATELIER_PRO_KEY=." .env.local .env.development.local .env.development .env 2>/dev/null
```

**Missing:** stop. Ask whether they added their license key, from their account page, into a git-ignored `.env.local` as `ATELIER_PRO_KEY=...`. Do not add the entry, do not install. An entry referencing an empty var fails free installs too.

**Present:** write the entry below, then install. Do not stop, do not mention the key.

```json
{
    "registries": {
        "@atelier": {
            "url": "https://www.atelier-ui.com/r/{name}.json",
            "headers": { "Authorization": "Bearer ${ATELIER_PRO_KEY}" }
        }
    }
}
```

A free install leaves `"@atelier"` set to the URL string alone, with no headers. That entry
counts as present and carries no key, so a pro add returns a 401. Overwrite it with the
object above rather than skipping the step because a `@atelier` key is already there.

Never ask for the key value. Never write it into a file yourself.

## Installing

Both tiers install by namespace. `@atelier` is in the shadcn registry directory, so the CLI
resolves it with no setup and writes the entry into `components.json` itself:

```sh
npx shadcn@latest add @atelier/<name>
```

What it writes is the bare URL string, which is everything a free item needs. A pro item
needs the object form from the section above, in place before the add command runs.

Dependencies resolve automatically.

## WebGL

All WebGL components share one canvas owned by `WebglProvider`. Mount once in the root layout:

```tsx
import { WebglProvider } from "@/components/webgl-provider/webgl-provider"

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <WebglProvider>{children}</WebglProvider>
            </body>
        </html>
    )
}
```

- Exactly one `WebglProvider`. Reuse an existing one, never add a second.
- Never add your own `<Canvas>` from `@react-three/fiber`.
- Mounted check: `<div data-atelier-webgl>` exists.

## Scroll

Scroll components need `SmoothScroll`, mounted once in the root layout. Order vs `WebglProvider` does not matter:

```tsx
<SmoothScroll>
    <WebglProvider>{children}</WebglProvider>
</SmoothScroll>
```

- Exactly one `SmoothScroll`. It drives Lenis with `autoRaf: false` on Motion's loop, so scroll, animation, and canvas share a frame.
- Existing Lenis or Locomotive Scroll v5: replace it, or set `autoRaf: false` and drive it from Motion's `frame.update`. Never two Lenis roots.
- GSAP ScrollSmoother: unsupported with WebGL media. It transforms content away from `window.scrollY`, which positions the planes.

## WebGL media

`WebglImage`, `WebglVideo`, `WebglText` render on top of the real DOM element.

- The element stays at `opacity: 0`. Never `display: none`, it breaks layout, SEO, and pointer events.
- It needs a size from CSS. No measurable box renders nothing.
- Fullscreen fixed canvas, so parent `overflow: hidden` does not clip. Order planes with `zIndex`.
- `object-fit` is read from computed style.
- `autoReflow` only when an animated parent moves the element. Costs a layout read per frame.

## Page transitions

Put the transition in the layout owning the routes it affects. Root layout covers every route, a route group layout covers that group.

```tsx
import { ClipTransition } from "@/components/clip-transition/clip-transition"
import { TransitionLink, TransitionPage } from "@/components/page-transition/page-transition"

export default function Layout({ children }) {
    return (
        <ClipTransition>
            <nav>
                <TransitionLink href="/work">Work</TransitionLink>
            </nav>
            <TransitionPage>{children}</TransitionPage>
        </ClipTransition>
    )
}
```

- Needs Next.js 15.3 or later. `TransitionLink` is built on the `Link` `onNavigate` prop,
  which does not exist before that. Check `next` in package.json first, and stop and say so
  if it is absent or older. The other components have no such floor.
- Route content must be wrapped in `TransitionPage`, or nothing animates.
- Use `TransitionLink`, not the Next.js `Link`.
- Never nest transitions.
- Cover `z-index: 60`, band `70`, loading slot `75`. Anything fixed above `75` stays visible.
- `data-atelier-transitioning` is set on `<html>` while running. Use it to hide persistent UI.

## Lint

This section applies only to projects linting with `eslint-config-next` 16 or later, which
is what `create-next-app` sets up. Check for an `eslint.config.*` at the project root and
`eslint-config-next` in package.json. Biome, oxlint, or no linter at all: skip the rest of
this section, there is nothing to do.

react-three-fiber mutates `camera` and `gl` and reads refs inside `useFrame`.
The React Compiler rules in `eslint-config-next` 16 report all of that as errors in the
installed files. The code is correct, the rules just don't model a second reconciler.

Write the override as part of the install, right after the add command. The errors are
certain, so running the linter first only buys you the same list at the cost of reading it.

Scope it to the installed paths rather than editing the files.
The globs below match both layouts, since the files land under `src/components/` or
`components/` depending on the project. The second and third cover the shared hooks and
helpers, which land outside `components/` and trip the same rules:

```js
{
    files: [
        "**/components/<name>/**",
        "**/hooks/use-{dom-plane,pointer-uv,render,frame-loop}.ts",
        "**/lib/object-fit.ts",
    ],
    rules: {
        "react-hooks/immutability": "off",
        "react-hooks/refs": "off",
        "react-hooks/preserve-manual-memoization": "off",
        "@next/next/no-img-element": "off",
    },
}
```

The `no-img-element` line is for the `sr-only` fallback list, which is an accessibility
layer and not something `next/image` should touch.

## Verify

The project's build passes. For WebGL components, `[data-atelier-webgl]` appears exactly once.

Open a browser only if a driver is already set up in the project. Never install one for
this, and never sample canvas pixels to prove it drew: the drawing buffer isn't preserved,
so a working canvas reads back as empty.
