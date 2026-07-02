/**
 * Single entry point for jQuery + the jQuery UI widget factory.
 *
 * Import `$` from here (never straight from 'jquery') so that every module
 * shares one jQuery instance with the widget factory already attached. We pull
 * in only `ui/widget.js` — not the full jQuery UI bundle — because all we need
 * is `$.widget`.
 */
import $ from 'jquery';
import 'jquery-ui/ui/widget.js';

export default $;
