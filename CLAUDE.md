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
- **Load order matters.** `index.html` lists scripts in dependency order: vendored jQuery → vendored jQuery UI → `namespace` → `persistence` → `widget-registry` → `user-data` → `panel` → `workspace` → `menu` → `app` → `widgets/index` → `models` → `main`. Content-widget scripts are **not** listed; they're injected on demand.
- **Dynamic widget loading = `<script>` injection**, not `import()`. `import()` is blocked over `file://`; injecting a classic `<script>` tag works. This is how the "widgets load dynamically" requirement is met.

## Architecture

`index.html` loads the scripts, then `src/main.js` constructs a `Similex.App` on `#app`.

- `vendor/jquery.min.js` — jQuery 3.7 (unchanged upstream).
- `vendor/jquery-ui.js` — a concatenated subset of jQuery UI 1.13 UMD source modules (version, widget factory, mouse, data, disable-selection, plugin, scroll-parent, draggable, resizable) in dependency order. With a global jQuery present, each module's UMD wrapper calls `factory(jQuery)`. Regenerate by concatenating from a jquery-ui source checkout if the subset changes. NOTE: resizable needs handle-placement CSS — shipped in `styles.css`; without it resizing silently no-ops.
- `src/core/namespace.js` — creates `window.Similex`.
- `src/core/persistence.js` — `Similex.persistence`: guarded localStorage access (works on `file://`). Generic slots `readJSON(key)`/`writeJSON(key,value)`/`removeKey(key)` degrade to no-op/null on a disabled/full/corrupt store; the workspace session slot (`save`/`load`/`clear`, key `similex.workspace.v1`) is a thin wrapper over them.
- `src/core/widget-registry.js` — `Similex.widgetRegistry`: the single source of truth for which widgets exist. `register(name, { src, label, title, options })` records a widget's script URL and its menu presentation metadata; `loadWidget(name)` injects the `<script>` (once) and resolves to the jQuery UI plugin method name the widget reports via `_loaded(name, method)`. `list()` returns each widget's `{ name, label, title, options }` in registration order — used to build the menu generically.
- `src/core/user-data.js` — `Similex.userData`: the single global container for all user data, a plain nested object addressed by **path strings** (`'models/graph-2/count'`). App code owns the shape (e.g. a `models` map, a shared `ontology`); the framework only speaks paths. A panel's `ref` is a path into here. Read: `get(ref)` / `has(ref)` / `keys(ref)`. Mutate (the only entry points): `set(ref,value)` (auto-creates intermediate objects, returns prior), `update(ref,patch)` (shallow-merge), `remove(ref)`, `batch(fn)` (one deferred localStorage write). Every mutation **autosaves** the whole store to localStorage (`similex.userData.v1`, separate from the session slot) and emits `{type,ref,value,prior}` to `subscribe(refPrefix,fn)` listeners (matched when change/watched paths lie on one root-to-node line — the pub/sub substrate). `toJSON(ref)`/`fromJSON(ref,obj)` deep-copy a subtree for file interchange; `load()`/`clear()` manage the persisted slot (values are stored by reference — mutate only via the API, never a `get` result in place).
- `src/core/app.js` — `Similex.App` composes menu + workspace into the root; `setMenu`, `addPanel`, `clearWorkspace`, `restore`. Persists on every workspace change.
- `src/core/menu.js` — `similex.menu` widget. Config-driven `items` array of `{ label, onSelect?, items? }` (nested `items` = submenu).
- `src/core/workspace.js` — `similex.workspace` widget. `addPanel({ title, widget, options, ref, id, geometry, minimized, maximized })`; mints a stable panel `id` (`'p0'`, `'p1'`, … via `_mintId`) when one isn't supplied, seeding the counter past restored ids so new panels never collide. Keeps a metadata entry per panel so `serialize()`/`restore()` round-trip the whole workspace (including each panel's `id` and `ref`); fires `onChange` on any add/remove/move/resize/min/maximise (suspended during `restore`).
- `src/core/panel.js` — `similex.panel` widget = titlebar (title + minimise/maximise/close) + content div. `panel('content')` returns the content element. Draggable by titlebar and resizable; `minimize`/`maximize` toggles; tracks its "normal" `geometry()` for restore/persist. Absolutely positioned; reports `onFocus` (raise) and `onChange` (persist). Button glyphs are pure CSS. Also carries two identifiers, both persisted: `id` — a stable per-instance id (e.g. `'p3'`, usually assigned by the workspace), via `panel('id')`; and `ref` — a path string addressing the "thing" the panel is a view of (e.g. `'models/graph-2'`), keyed into `Similex.userData`, via `panel('ref')` get / `panel('ref', str)` set. The panel doesn't interpret `ref` — it's groundwork for a future pub/sub layer that will scope cross-panel updates to panels sharing a subject. `id` names the panel; `ref` names what it views (several panels may share one `ref`).
- `src/widgets/index.js` — the widget **manifest**: the one place listing the app's content widgets (script URL + label/title/options). `main.js` builds the Widgets menu from `widgetRegistry.list()`, so `main.js` has no per-widget knowledge — adding a widget is a single registration here.
- `src/widgets/*.js` — content widgets: `clock`, `hello`, `counter`, `notepad`, `colorpicker`.
- `src/models.js` — `Similex.models`: the app's thin **model layer** over `userData` — the one place that knows user data is a `models/<id>` map (`{ id, name, … }`). `list()` / `get(ref)` / `ref(id)`; lifecycle `create` / `copy` (Save As) / `rename` / `remove`; a *current* model (`current`/`setCurrent`); file interchange `exportFile`/`importFile`/`exportAll`/`importAll` (Blob download + `<input type=file>` — file:// forbids silent writes; DOM I/O is in `_download`/`_pickFile`, stubbable for tests). localStorage is the live autosaved store (via `userData`), so there is no "Save". `main.js` builds a **File menu** from this and rebuilds `File ▸ Open` whenever the model set changes (a `userData.subscribe('models', …)`). NOTE (Phase 2, plumbing only): New/Open manipulate model data but do not yet open a panel viewing a model — that arrives with the widget-model binding (planned Phase 4).

### Content widget contract

A content widget script must (1) register itself via `$.widget('similex.<name>', {...})` using the global `$`, and (2) at the end call `window.Similex.widgetRegistry._loaded('<name>', '<name>')` where the second arg is the jQuery UI plugin method name to invoke on the panel's content element. Add it to the manifest in `src/widgets/index.js` via `register('<name>', { src, label, title, options })`; the menu picks it up automatically.

For persistence, a widget MAY implement a `state()` method returning a plain, JSON-serialisable object. On save it's merged into the panel's stored `options`; on restore the merged options are passed back to the widget's constructor, so `state()` keys must be constructor option names (e.g. counter returns `{ start }`, notepad returns `{ text }`). Widgets without `state()` restore from their original options.

### Conventions

- The `.menu()` / `.workspace()` / `.panel()` plugin names are safe because `vendor/jquery-ui.js` includes only the widget factory + draggable/resizable, not jQuery UI's own `menu` widget. If you add more of jQuery UI to the vendor bundle, check for name collisions.
