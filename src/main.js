/**
 * Bootstrap: build the App, define the menu, restore any saved workspace.
 * Classic script — runs after all core scripts have loaded. No imports/exports.
 */
(function (Similex) {
  'use strict';

  var app = new Similex.App('#app');

  app.setMenu([
    {
      label: 'Widgets',
      items: [
        {
          label: 'Clock',
          onSelect: function () {
            app.addPanel({ title: 'Clock', widget: 'clock' });
          },
        },
        {
          label: 'Greeting',
          onSelect: function () {
            app.addPanel({
              title: 'Greeting',
              widget: 'hello',
              options: { name: 'similex' },
            });
          },
        },
        {
          label: 'Counter',
          onSelect: function () {
            app.addPanel({ title: 'Counter', widget: 'counter' });
          },
        },
        {
          label: 'Notepad',
          onSelect: function () {
            app.addPanel({ title: 'Notepad', widget: 'notepad' });
          },
        },
        {
          label: 'Colour picker',
          onSelect: function () {
            app.addPanel({ title: 'Colour', widget: 'colorpicker' });
          },
        },
      ],
    },
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
