/**
 * Registers the built-in content widgets with the registry, mapping each name
 * to the URL of its script (relative to index.html). The scripts themselves are
 * NOT loaded here — the registry injects them on demand the first time a widget
 * is opened, so widget code is only fetched when needed.
 *
 * To add a widget: create `src/widgets/<name>.js` that calls
 * `$.widget('similex.<name>', {...})` and, at the end,
 * `Similex.widgetRegistry._loaded('<name>', '<name>')`; then register it here.
 *
 * Classic script; no imports/exports.
 */
(function (Similex) {
  'use strict';
  var reg = Similex.widgetRegistry;
  reg.register('clock', 'src/widgets/clock.js');
  reg.register('hello', 'src/widgets/hello.js');
  reg.register('counter', 'src/widgets/counter.js');
  reg.register('notepad', 'src/widgets/notepad.js');
  reg.register('colorpicker', 'src/widgets/colorpicker.js');
})(window.Similex);
