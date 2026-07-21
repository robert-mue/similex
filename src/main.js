/**
 * Bootstrap: build the App, define the menu, restore any saved workspace.
 *
 * The menu is rebuilt from data:
 *   - the Widgets submenu comes from the widget registry (src/widgets/index.js),
 *   - the File ▸ Open submenu comes from the model list (Similex.models),
 * so this file holds no per-widget or per-model knowledge. The menu is rebuilt
 * whenever the set of models changes (a userData change under `models`).
 *
 * Classic script — runs after all core scripts have loaded. No imports/exports.
 */
(function (Similex) {
  'use strict';

  var app = new Similex.App('#app');
  var models = Similex.models;

  // One Widgets entry per registered widget, in registration order.
  var widgetItems = Similex.widgetRegistry.list().map(function (w) {
    return {
      label: w.label,
      onSelect: function () {
        app.addPanel({ title: w.title, widget: w.name, options: w.options });
      },
    };
  });

  // File ▸ Open lists the current models; empty => a single inert placeholder.
  function openItems() {
    var list = models.list();
    if (!list.length) return [{ label: '(no models)' }];
    return list.map(function (m) {
      return {
        label: m.name,
        onSelect: function () {
          models.setCurrent(m.ref);
        },
      };
    });
  }

  function fileItems() {
    return [
      { label: 'New', onSelect: function () { models.create(); } },
      { label: 'Open', items: openItems() },
      {
        label: 'Save As',
        onSelect: function () {
          var c = models.current();
          if (c) models.copy(c);
        },
      },
      {
        label: 'Export',
        onSelect: function () {
          var c = models.current();
          if (c) models.exportFile(c);
        },
      },
      { label: 'Import', onSelect: function () { models.importFile(); } },
      { label: 'Export all', onSelect: function () { models.exportAll(); } },
      { label: 'Import all', onSelect: function () { models.importAll(); } },
    ];
  }

  function buildMenu() {
    return [
      { label: 'File', items: fileItems() },
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
    ];
  }

  app.setMenu(buildMenu());

  // Rebuild the menu whenever the set of models changes, so File ▸ Open stays
  // in sync. (Cheap: the menu is small and re-rendered from config.)
  Similex.userData.subscribe('models', function () {
    app.setMenu(buildMenu());
  });

  // Restore any panels saved from a previous session.
  app.restore();

  // Handy for tinkering from the browser console.
  window.app = app;
})(window.Similex);
