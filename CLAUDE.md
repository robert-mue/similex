# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**similex** is a jQuery-based single-page app: a customisable **menu** plus a **workspace** that holds **panels**, where each panel hosts a **content widget** built with the jQuery UI widget factory. Content widgets are loaded dynamically. Bundled with Vite; tests run on Vitest.

## Commands

Requires Node.js 18+ and a one-time `npm install`.

- `npm run dev` — start the Vite dev server (hot reload)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm test` — run the test suite once (`vitest run`)
- `npm run test:watch` — watch mode
- Run a single test file: `npx vitest run src/core/widget-registry.test.js`
- Filter by test name: `npx vitest run -t "unknown"`
- `npm run lint` / `npm run lint:fix` — ESLint (flat config, `eslint.config.js`)
- `npm run format` / `npm run format:check` — Prettier

Prettier owns formatting; ESLint is configured with `eslint-config-prettier` so the
two don't fight. Lint for correctness, format for style.

## Architecture

Entry: `index.html` loads `src/main.js`, which constructs an `App` on `#app`.

- `src/core/jquery-global.js` — installs the global `jQuery`/`$`. jQuery UI 1.13's UMD wrapper falls through to `factory(jQuery)` (a _global_ reference) under Vite's ESM bundling, so this must load before any `jquery-ui/*` import or you get `jQuery is not defined`. Imported first by `widget-base.js`; don't import a jquery-ui file ahead of it.
- `src/core/widget-base.js` — **import `$` from here**, never straight from `'jquery'`. Imports `jquery-global.js` then attaches the jQuery UI widget factory (only `jquery-ui/ui/widget.js`, not the full UI bundle) so every module shares one jQuery instance with `$.widget` available.
- `src/core/interactions.js` — loads jQuery UI `draggable` **and** `resizable` **plus their shared dependency chain** (`mouse`, `data`, `plugin`, `scroll-parent`, `disable-selection`, `version`). jQuery UI's UMD build doesn't resolve its own inter-module deps when a single file is imported, so importing `draggable.js`/`resizable.js` alone throws `Cannot read properties of undefined (reading 'mouse')`. Any code needing a jQuery UI interaction widget imports from here (chain in dependency order after `widget-base.js`). NOTE: resizable also needs handle-placement CSS — we ship minimal rules in `styles.css`; without them resizing silently no-ops.
- `src/core/app.js` — `App` composes the menu and workspace into the root element; exposes `setMenu`, `addPanel`, `clearWorkspace`, `restore`. Persists the workspace to localStorage on every workspace change (`onChange`).
- `src/core/menu.js` — `similex.menu` widget. Customisable, config-driven: an `items` array of `{ label, onSelect?, items? }` (nested `items` = submenu).
- `src/core/workspace.js` — `similex.workspace` widget. Manages panels; `addPanel({ title, widget, options, geometry, minimized, maximized })` creates a panel and instantiates the named content widget. Keeps a metadata entry per panel so `serialize()`/`restore()` can round-trip the whole workspace; fires `onChange` on any add/remove/move/resize/min/maximise (suspended during `restore`).
- `src/core/panel.js` — `similex.panel` widget = titlebar (title + minimise/maximise/close controls) + content div. `panel('content')` returns the content element. Draggable by its titlebar and resizable (from `interactions.js`); supports `minimize`/`maximize` toggles and tracks its "normal" `geometry()` (position+size when neither min nor max) for restore/persist. Free-floating (absolutely positioned); reports `onFocus` (raise) and `onChange` (persist). Button glyphs are pure CSS (no icon font).
- `src/core/persistence.js` — guarded localStorage read/write of the serialised workspace under a versioned key; degrades to no-op if storage is unavailable.
- `src/core/widget-registry.js` — maps a widget name to a lazy `() => import(...)` loader. `loadWidget(name)` dynamically imports the module and returns its jQuery UI plugin method name. No jQuery dependency itself, so it's unit-testable in a node env.
- `src/widgets/index.js` — registers the built-in content widgets' loaders.
- `src/widgets/*.js` — content widgets: `clock`, `hello`, `counter`, `notepad`, `colorpicker`.

### Content widget contract

A content widget module must (1) register itself via `$.widget('similex.<name>', {...})` using `$` from `widget-base.js`, and (2) `export default '<name>'` — the jQuery UI plugin method name the registry invokes on the panel's content element. Register its lazy loader in `src/widgets/index.js`.

For persistence, a widget MAY implement a `state()` method returning a plain, JSON-serialisable object. On save it's merged into the panel's stored `options`; on restore the merged options are passed back to the widget's constructor, so `state()` keys must be constructor option names (e.g. counter returns `{ start }`, notepad returns `{ text }`). Widgets without `state()` just restore from their original options.

### Conventions

- The `.menu()` / `.workspace()` / `.panel()` plugin names are safe because only the widget _factory_ is loaded, not jQuery UI's own widgets (which include `menu`). Don't import the full jQuery UI bundle without checking for name collisions.
- Tests run in a `node` environment, so keep DOM/jQuery out of anything you want to unit-test directly (see `widget-registry.js`). Widget DOM behaviour is not currently covered by tests.
