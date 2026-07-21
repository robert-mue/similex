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

  // Open a panel viewing a model (the counter is the model-bound pilot widget).
  function openModel(ref) {
    var m = models.get(ref) || {};
    app.addPanel({ title: m.name || ref, widget: 'counter', ref: ref });
  }

  // File ▸ Open lists the current models; empty => a single inert placeholder.
  function openItems() {
    var list = models.list();
    if (!list.length) return [{ label: '(no models)' }];
    return list.map(function (m) {
      return {
        label: m.name,
        onSelect: function () {
          models.setCurrent(m.ref);
          openModel(m.ref);
        },
      };
    });
  }

  function fileItems() {
    return [
      {
        label: 'New',
        onSelect: function () {
          openModel(models.create());
        },
      },
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

  // Rebuild the menu only when the *set* of models (ids/names) changes, so a
  // model's contents changing (e.g. a bound counter's count) doesn't rebuild it.
  function modelsSignature() {
    return JSON.stringify(
      models.list().map(function (m) {
        return [m.id, m.name];
      }),
    );
  }
  var lastSignature = modelsSignature();
  Similex.userData.subscribe('models', function () {
    var sig = modelsSignature();
    if (sig === lastSignature) return;
    lastSignature = sig;
    app.setMenu(buildMenu());
  });

  // Restore any panels saved from a previous session.
  app.restore();

  // Handy for tinkering from the browser console.
  window.app = app;
})(window.Similex);
