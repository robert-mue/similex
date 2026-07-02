/**
 * Exposes jQuery as a global BEFORE any jQuery UI module loads.
 *
 * jQuery UI 1.13's UMD wrapper falls through to `factory(jQuery)` — a reference
 * to a *global* `jQuery` — when it can't find an AMD loader. Under Vite's ESM
 * bundling there is no AMD and no global, so loading `jquery-ui/ui/widget.js`
 * throws `jQuery is not defined`.
 *
 * ES module imports evaluate in source order and a module's body runs to
 * completion before its importer's, so importing this module *before* any
 * jquery-ui import guarantees the global is set in time. Import it first from
 * `widget-base.js`; never import a jquery-ui file ahead of it.
 */
import jQuery from 'jquery';

globalThis.jQuery = jQuery;
globalThis.$ = jQuery;

export default jQuery;
