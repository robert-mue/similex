# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**similex** is a **static** jQuery single-page app: a customisable **menu** plus a **workspace** that holds **panels**, where each panel hosts a **content widget** built with the jQuery UI widget factory. Content widgets are loaded dynamically.

There is **no build step, no server, and no npm**. It runs by opening `index.html` directly (`file://`). Everything is plain classic `<script>` tags — **no ES modules, no imports/exports** — because browsers block ES modules and `fetch`/`import()` over `file://`.

## Running

Open `index.html` in a browser (double-click, or `google-chrome index.html`). That's it. Any static file host works too, but none is required.

There are no automated tests/lint/build commands — the tooling was intentionally removed. Verify changes by opening the page and using it; check the devtools console for errors.

## Key constraints (why it's built this way)

- **Classic scripts only.** No `import`/`export`. Modules communicate through the single global `window.Similex` (see `src/core/namespace.js`). jQuery is the global `$`/`jQuery` from the vendored scripts.
- **Load order matters.** `index.html` lists scripts in dependency order: vendored jQuery → vendored jQuery UI → `namespace` → `persistence` → `widget-registry` → `panel` → `workspace` → `menu` → `app` → `widgets/index` → `main`. Content-widget scripts are **not** listed; they're injected on demand.
- **Dynamic widget loading = `<script>` injection**, not `import()`. `import()` is blocked over `file://`; injecting a classic `<script>` tag works. This is how the "widgets load dynamically" requirement is met.

## Architecture

`index.html` loads the scripts, then `src/main.js` constructs a `Similex.App` on `#app`.

- `vendor/jquery.min.js` — jQuery 3.7 (unchanged upstream).
- `vendor/jquery-ui.js` — a concatenated subset of jQuery UI 1.13 UMD source modules (version, widget factory, mouse, data, disable-selection, plugin, scroll-parent, draggable, resizable) in dependency order. With a global jQuery present, each module's UMD wrapper calls `factory(jQuery)`. Regenerate by concatenating from a jquery-ui source checkout if the subset changes. NOTE: resizable needs handle-placement CSS — shipped in `styles.css`; without it resizing silently no-ops.
- `src/core/namespace.js` — creates `window.Similex`.
- `src/core/persistence.js` — `Similex.persistence`: guarded localStorage read/write of the serialised workspace under a versioned key (works on `file://`).
- `src/core/widget-registry.js` — `Similex.widgetRegistry`: the single source of truth for which widgets exist. `register(name, { src, label, title, options })` records a widget's script URL and its menu presentation metadata; `loadWidget(name)` injects the `<script>` (once) and resolves to the jQuery UI plugin method name the widget reports via `_loaded(name, method)`. `list()` returns each widget's `{ name, label, title, options }` in registration order — used to build the menu generically.
- `src/core/app.js` — `Similex.App` composes menu + workspace into the root; `setMenu`, `addPanel`, `clearWorkspace`, `restore`. Persists on every workspace change.
- `src/core/menu.js` — `similex.menu` widget. Config-driven `items` array of `{ label, onSelect?, items? }` (nested `items` = submenu).
- `src/core/workspace.js` — `similex.workspace` widget. `addPanel({ title, widget, options, geometry, minimized, maximized })`; keeps a metadata entry per panel so `serialize()`/`restore()` round-trip the whole workspace; fires `onChange` on any add/remove/move/resize/min/maximise (suspended during `restore`).
- `src/core/panel.js` — `similex.panel` widget = titlebar (title + minimise/maximise/close) + content div. `panel('content')` returns the content element. Draggable by titlebar and resizable; `minimize`/`maximize` toggles; tracks its "normal" `geometry()` for restore/persist. Absolutely positioned; reports `onFocus` (raise) and `onChange` (persist). Button glyphs are pure CSS.
- `src/widgets/index.js` — the widget **manifest**: the one place listing the app's content widgets (script URL + label/title/options). `main.js` builds the Widgets menu from `widgetRegistry.list()`, so `main.js` has no per-widget knowledge — adding a widget is a single registration here.
- `src/widgets/*.js` — content widgets: `clock`, `hello`, `counter`, `notepad`, `colorpicker`.

### Content widget contract

A content widget script must (1) register itself via `$.widget('similex.<name>', {...})` using the global `$`, and (2) at the end call `window.Similex.widgetRegistry._loaded('<name>', '<name>')` where the second arg is the jQuery UI plugin method name to invoke on the panel's content element. Add it to the manifest in `src/widgets/index.js` via `register('<name>', { src, label, title, options })`; the menu picks it up automatically.

For persistence, a widget MAY implement a `state()` method returning a plain, JSON-serialisable object. On save it's merged into the panel's stored `options`; on restore the merged options are passed back to the widget's constructor, so `state()` keys must be constructor option names (e.g. counter returns `{ start }`, notepad returns `{ text }`). Widgets without `state()` restore from their original options.

### Conventions

- The `.menu()` / `.workspace()` / `.panel()` plugin names are safe because `vendor/jquery-ui.js` includes only the widget factory + draggable/resizable, not jQuery UI's own `menu` widget. If you add more of jQuery UI to the vendor bundle, check for name collisions.
