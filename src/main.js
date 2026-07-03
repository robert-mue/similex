/**
 * Bootstrap: build the App, define the menu, restore any saved workspace.
 *
 * The Widgets submenu is built generically from the widget registry (see
 * src/widgets/index.js) — this file contains no per-widget knowledge, so adding
 * a widget never means editing here.
 *
 * Classic script — runs after all core scripts have loaded. No imports/exports.
 */
(function (Similex) {
  'use strict';

  var app = new Similex.App('#app');

  // One menu entry per registered widget, in registration order.
  var widgetItems = Similex.widgetRegistry.list().map(function (w) {
    return {
      label: w.label,
      onSelect: function () {
        app.addPanel({ title: w.title, widget: w.name, options: w.options });
      },
    };
  });

  app.setMenu([
    { label: 'Widgets', items: widgetItems },
    {
      label: 'View',
      items: [
        {
          label: 'Clear workspace',
          onSelect: function () {
            app.clearWorkspace();
          },
        },
      ],
    },
  ]);

  // Restore any panels saved from a previous session.
  app.restore();

  // Handy for tinkering from the browser console.
  window.app = app;
})(window.Similex);
