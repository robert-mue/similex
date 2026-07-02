/**
 * Single entry point for jQuery + the jQuery UI widget factory.
 *
 * Import `$` from here (never straight from 'jquery') so that every module
 * shares one jQuery instance with the widget factory already attached. We pull
 * in only `ui/widget.js` — not the full jQuery UI bundle — because all we need
 * is `$.widget`.
 *
 * `./jquery-global.js` must be imported first: it installs the global `jQuery`
 * that jQuery UI's UMD wrapper needs before `ui/widget.js` evaluates.
 */
import $ from './jquery-global.js';
import 'jquery-ui/ui/widget.js';

export default $;
