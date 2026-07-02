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

- `src/core/jquery-global.js` — installs the global `jQuery`/`$`. jQuery UI 1.13's UMD wrapper falls through to `factory(jQuery)` (a *global* reference) under Vite's ESM bundling, so this must load before any `jquery-ui/*` import or you get `jQuery is not defined`. Imported first by `widget-base.js`; don't import a jquery-ui file ahead of it.
- `src/core/widget-base.js` — **import `$` from here**, never straight from `'jquery'`. Imports `jquery-global.js` then attaches the jQuery UI widget factory (only `jquery-ui/ui/widget.js`, not the full UI bundle) so every module shares one jQuery instance with `$.widget` available.
- `src/core/draggable-base.js` — loads jQuery UI `draggable` **plus its dependency chain** (`mouse`, `data`, `plugin`, `scroll-parent`, `version`). jQuery UI's UMD build doesn't resolve its own inter-module deps when a single file is imported, so importing `draggable.js` alone throws `Cannot read properties of undefined (reading 'mouse')`. Any code needing a jQuery UI interaction widget should follow this pattern: import the full dep chain in order after `widget-base.js`.
- `src/core/app.js` — `App` composes the menu and workspace into the root element; exposes `setMenu`, `addPanel`, `clearWorkspace`.
- `src/core/menu.js` — `similex.menu` widget. Customisable, config-driven: an `items` array of `{ label, onSelect?, items? }` (nested `items` = submenu).
- `src/core/workspace.js` — `similex.workspace` widget. Manages panels; `addPanel({ title, widget, options })` creates a panel and instantiates the named content widget into it.
- `src/core/panel.js` — `similex.panel` widget = titlebar (title + close) + content div. `panel('content')` returns the content element. Draggable by its titlebar (jQuery UI `draggable`, loaded per-panel), and reports `onFocus` so the workspace can raise it. Panels are free-floating (absolutely positioned); the workspace cascades new ones and manages z-order.
- `src/core/widget-registry.js` — maps a widget name to a lazy `() => import(...)` loader. `loadWidget(name)` dynamically imports the module and returns its jQuery UI plugin method name. No jQuery dependency itself, so it's unit-testable in a node env.
- `src/widgets/index.js` — registers the built-in content widgets' loaders.
- `src/widgets/*.js` — content widgets: `clock`, `hello`, `counter`, `notepad`, `colorpicker`.

### Content widget contract

A content widget module must (1) register itself via `$.widget('similex.<name>', {...})` using `$` from `widget-base.js`, and (2) `export default '<name>'` — the jQuery UI plugin method name the registry invokes on the panel's content element. Register its lazy loader in `src/widgets/index.js`.

### Conventions

- The `.menu()` / `.workspace()` / `.panel()` plugin names are safe because only the widget _factory_ is loaded, not jQuery UI's own widgets (which include `menu`). Don't import the full jQuery UI bundle without checking for name collisions.
- Tests run in a `node` environment, so keep DOM/jQuery out of anything you want to unit-test directly (see `widget-registry.js`). Widget DOM behaviour is not currently covered by tests.
