import { App } from './core/app.js';
import './widgets/index.js';
import './styles.css';

const app = new App('#app');

app.setMenu([
  {
    label: 'Widgets',
    items: [
      {
        label: 'Clock',
        onSelect: () => app.addPanel({ title: 'Clock', widget: 'clock' }),
      },
      {
        label: 'Greeting',
        onSelect: () =>
          app.addPanel({
            title: 'Greeting',
            widget: 'hello',
            options: { name: 'similex' },
          }),
      },
      {
        label: 'Counter',
        onSelect: () => app.addPanel({ title: 'Counter', widget: 'counter' }),
      },
      {
        label: 'Notepad',
        onSelect: () => app.addPanel({ title: 'Notepad', widget: 'notepad' }),
      },
      {
        label: 'Colour picker',
        onSelect: () =>
          app.addPanel({ title: 'Colour', widget: 'colorpicker' }),
      },
    ],
  },
  {
    label: 'View',
    items: [{ label: 'Clear workspace', onSelect: () => app.clearWorkspace() }],
  },
]);

// Restore any panels saved from a previous session.
app.restore();

// Handy for tinkering from the browser console.
globalThis.app = app;
