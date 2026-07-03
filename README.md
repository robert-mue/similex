# similex

A static jQuery single-page app: a customisable menu and a workspace of
draggable / resizable / minimisable / maximisable panels, where each panel hosts
a dynamically loaded jQuery UI widget. Open panels persist across reloads.

## Running

No build, no server, no dependencies to install. Just open the file:

```
Double-click index.html  (or:  google-chrome index.html)
```

Everything is plain HTML/CSS/JS with vendored jQuery + jQuery UI in `vendor/`.

## Using it

- **Widgets** menu — open panels (Clock, Greeting, Counter, Notepad, Colour picker).
- Drag panels by their titlebar; resize from any edge/corner.
- Titlebar buttons: **—** minimise, **▢** maximise, **×** close.
- **View ▸ Clear workspace** removes all panels.
- Your open panels (and their contents) are saved to the browser and restored on reload.
