---
name: m3-theme-styling
description: >
  Use this skill when adding, changing, or reviewing UI in the
  ansible-tutorial-app project (React + Vite + @material/web) — new pages,
  components, colors, spacing, dark mode, or any Material Web (`md-*`)
  element. Covers the Material 3 Expressive design tokens (color, type,
  shape), the app-shell layout system, established component patterns, and
  the hard-won gotchas for using @material/web custom elements with React.
  Applies to files under ansible-tutorial-app/src/**. Trigger on: "add a
  page/component", "style this to match", "dark mode", "add an md-*
  element", "sidebar/drawer", "card", "chip", "collapsible", or any Material
  Design / Material 3 question about this app.
---

# Ansible Tutorial App — Theme, Layout & Styling

Reference for keeping new UI work consistent with the Material 3 Expressive
design system already established in this app, and for avoiding the
non-obvious bugs already hit once while building it.

## Where things live

- `src/theme.css` — design tokens: color, type scale, shape scale.
- `src/app.css` — layout (`.app-shell` grid, drawer, topbar) + component
  styles (cards, code blocks, chips, nav items).
- `src/main.jsx` — imports `@material/web/all.js` plus the `labs/*`
  components not included in it (card, segmented-button). Add new labs
  imports here if you pull in `md-navigation-*` or similar.
- `src/components/` — one file per UI piece (`QuestionCard`, `CodeBlock`,
  `SectionView`, `Overview`, `SearchResults`).
- `src/data/questions.js` — all content; UI components should stay
  content-agnostic and just render this shape.

## Design language

Material 3 Expressive, Google-website look, built from **real** Material Web
Components (`@material/web`) — never hand-roll a button/card/chip/switch
when an `md-*` element already exists for it. Expressiveness comes from
generous rounding + confident color, not custom widgets.

## Color

- All color is expressed as M3 system-role custom properties
  (`--md-sys-color-*`) on `:root` — this is how `@material/web` components
  pick up theming automatically. Never hardcode a hex color on an `md-*`
  element or its children; add/adjust a `--md-sys-color-*` (or app-specific
  `--accent-*`) token instead.
- Light values live in the base `:root` block in `theme.css`. Dark values
  live in **two places that must be kept in sync**:
  `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) {...} }`
  (system preference) and `:root[data-theme='dark'] {...}` (explicit in-app
  toggle, set via `document.documentElement.setAttribute('data-theme', ...)`
  in `App.jsx`). Adding a new color token means adding it to light `:root`
  **and both** dark blocks, or it silently falls back to a Material Web
  default in dark mode.
- Each of the 5 content sections has its own accent pair: `--accent-N`,
  `--accent-N-container`, `--accent-N-on-container` (N = 1–5). Use these —
  not the generic primary/secondary tokens — for anything that should
  visually key to a specific section (nav icons, badges, card icons).
- Dark-mode toggle state persists to `localStorage['ansible-tutorial-theme']`.

## Typography

`--font-brand` (Google Sans) for headings/titles, `--font-body` (Roboto
Flex) for body copy, `--font-mono` (Roboto Mono) for code. Use the type-scale
utility classes already defined in `theme.css` — `.display-lg/md`,
`.headline-lg/md/sm`, `.title-lg/md/sm`, `.body-lg/md/sm`, `.label-lg/md` —
rather than writing ad hoc `font-size`/`font-family` declarations.

## Shape

Corner radii are tokenized: `--shape-xs` (12px) through `--shape-xl` (36px)
and `--shape-full` (pill). Cards use `--shape-lg`; buttons/chips are
pill-shaped. Apply shape by setting the *component's own* shape token (e.g.
`--md-elevated-card-container-shape: var(--shape-lg)`), not by fighting the
component with `border-radius` on the host — Material Web components read
shape from these tokens internally, not from a plain CSS `border-radius`.

## Icons — font mismatch gotcha

The Material Symbols font is loaded as **"Material Symbols Rounded"** in
`index.html`, but `md-icon` defaults to expecting
**"Material Symbols Outlined"**. This is fixed globally with
`--md-icon-font: 'Material Symbols Rounded';` on `:root` in `theme.css` —
don't remove that line, and don't load a different icon font without
updating it to match. If icons ever render as clipped literal text (e.g.
"om" instead of a home icon), this mismatch is why: the font failed to
apply and the fallback text got clipped by the icon's fixed-size box.

## Layout (`.app-shell`)

- Structure: CSS Grid `'topbar topbar' / 'drawer main'` in `.app-shell`.
  It **must** use `height: 100%`, not `min-height: 100%` — otherwise the
  grid rows aren't clamped to the viewport and `.main{overflow-y:auto}`
  never actually scrolls internally (the whole page scrolls instead),
  which silently breaks anything tracking `.main`'s `scrollTop` (e.g. the
  back-to-top FAB).
- `.main` is the real scroll container; route changes reset it to
  `scrollTop: 0` via a ref in `App.jsx`.
- Sidebar (`.drawer`) states:
  - **Desktop expanded** (default): 280px, full labels.
  - **Desktop collapsed**: icon-only 84px rail, toggled by the circular
    handle (`.drawer-collapse-handle`), state persisted to
    `localStorage['ansible-tutorial-drawer-collapsed']`. New drawer content
    must also be hidden in the `.drawer--collapsed` descendant-selector
    block or it'll leak into the collapsed rail.
  - **Mobile** (`≤900px`): drawer becomes a fixed full-height overlay
    toggled by the topbar hamburger (`.menu-toggle`) — independent of the
    collapsed state. Collapsing is desktop-only; the handle is
    force-hidden below 900px.
- Responsive breakpoints: `900px` (drawer → overlay), `620px` (topbar
  wraps: search field drops to its own full-width row via `order` +
  `flex-basis: 100%`).

## Components

- **Cards** — `md-elevated-card` for anything clickable/content-bearing.
  Corner radius comes from the global `--md-elevated-card-container-shape`
  token, not per-instance overrides.
- **Sample data vs. expected output** — two visual languages, on purpose:
  `CodeBlock` (light "file" chrome, filename header) for input files;
  `TerminalBlock` (dark, fixed-color terminal chrome with traffic-light
  dots) for command output. Keep that distinction for new question types —
  output should always look like a terminal, files should always look like
  a file.
- **Chips** — `md-assist-chip` for suggested filenames.
- **Level filter** — `md-outlined-segmented-button-set` /
  `md-outlined-segmented-button`, one per level plus "All".
- **Nav items** — plain `<button class="nav-item">`, not a Material Web
  component — needed full manual control over active/collapsed states that
  Material's own nav components don't expose cleanly for this layout.

## Hard-won gotchas (read before touching `md-*` elements in JSX)

1. **`className` doesn't work on true custom elements.** React only
   auto-converts `className` → `class` for tags it recognizes as standard
   HTML. Any element with a hyphen in its tag name (`md-elevated-card`,
   `md-icon-button`, `md-fab`, etc.) needs the literal `class` prop, or the
   class is silently dropped (renders as a bogus `classname="..."`
   attribute instead). Plain `div`/`span`/`button` are unaffected — keep
   using `className` there.
2. **Boolean props on Lit elements ignore falsiness.** Lit's default
   `type: Boolean` converter treats *attribute presence* as true, not the
   attribute's value — so `selected={false}` still renders `selected="false"`,
   which Lit reads as true. Always gate with `condition ? true : undefined`
   so the attribute is omitted entirely when false.
3. **Verify Material Web CSS custom property names in `node_modules`
   before using them** — they're inconsistent between components (e.g.
   `md-icon-button` has `--md-icon-button-state-layer-height/width` but no
   `container-width/height`; `md-elevated-card` has
   `--md-elevated-card-container-color`). Grep
   `node_modules/@material/web/<component>/internal/*.js` for the real
   token names rather than guessing from another component's pattern.
4. **CSS Grid items paint in DOM order when z-index is unset on both.** A
   positioned descendant that needs to visually sit above a *later*
   sibling grid item (e.g. a handle overflowing `.drawer` needing to
   appear over `.main`) needs an explicit `z-index` on the ancestor grid
   item — `position: relative` alone doesn't reorder paint order between
   grid siblings.
5. **`overflow-y: auto` implicitly clips `overflow-x` too.** Per the CSS
   Overflow spec, one axis can't stay `visible` while the other isn't — the
   browser silently forces the `visible` axis to `auto` as well. Don't rely
   on a vertically-scrolling element to let content overflow horizontally
   (e.g. an absolutely-positioned handle poking past its edge); anchor that
   content to a non-scrolling ancestor instead (see
   `.drawer-collapse-handle`, anchored to `.app-shell`, not `.drawer`).
6. **Flex/grid items default to `min-width: auto`**, which can force
   layout wider than the viewport on narrow screens even with `flex: 1`.
   Any flex child that must shrink below its content's natural width (e.g.
   the topbar search field) needs an explicit `min-width: 0`.
7. **`@material/web/all.js` doesn't include `labs/*` components.** Card,
   navigation-drawer/bar, and segmented-button live under `labs/` and need
   individual imports in `main.jsx` even when `all.js` is also imported.

## Verifying UI changes

- `npx` / `node_modules/.bin` symlinks don't resolve reliably in this
  environment — run tool binaries directly, e.g.
  `node node_modules/vite/bin/vite.js build` instead of `npm run build`.
- No `chromium-cli` available here; verify visually with a local Playwright
  install (`npm install playwright` in a scratch dir, then
  `node node_modules/playwright/cli.js install chromium`) and a small
  driver script that navigates, screenshots, and checks
  `page.on('console', ...)` for errors.
- Don't trust a shrunk-down screenshot preview for exact colors — sample
  actual pixel values (e.g. Python PIL `Image.getpixel`) when checking
  dark-mode or clipping issues; preview scaling can make correct dark
  colors look wrong, and can hide real 1-pixel-off clipping bugs.
