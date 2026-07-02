/**
 * `similex.panel` — a workspace panel: a titlebar (title + close button) plus a
 * content area into which a dynamically loaded widget is instantiated.
 *
 * Usage:
 *   $('<div>').panel({ title: 'Clock', onClose: (panel) => {...} });
 *   $el.panel('content');        // -> jQuery of the content element
 *   $el.panel('title', 'New');   // get/set the title
 */
import $ from './draggable-base.js';

$.widget('similex.panel', {
  options: {
    title: 'Panel',
    closable: true,
    draggable: true,
    /** @type {((panel: object) => void) | null} */
    onClose: null,
    /** Called when the panel is activated (e.g. clicked) — used to raise it. */
    onFocus: null,
  },

  _create() {
    this.element.addClass('slx-panel');

    this._titlebar = $('<div class="slx-panel-titlebar">').appendTo(
      this.element,
    );
    this._titleEl = $('<span class="slx-panel-title">')
      .text(this.options.title)
      .appendTo(this._titlebar);

    if (this.options.closable) {
      this._closeBtn = $(
        '<button type="button" class="slx-panel-close" aria-label="Close">&times;</button>',
      ).appendTo(this._titlebar);
      this._on(this._closeBtn, { click: '_onCloseClick' });
    }

    this._contentEl = $('<div class="slx-panel-content">').appendTo(
      this.element,
    );

    this._on(this.element, { mousedown: '_onFocus' });

    if (this.options.draggable) {
      this.element.addClass('slx-panel--draggable').draggable({
        handle: '.slx-panel-titlebar',
        cancel: '.slx-panel-close',
        containment: 'parent',
        stack: '.slx-panel',
      });
    }
  },

  /** @returns {JQuery} the content element to host a widget */
  content() {
    return this._contentEl;
  },

  /** get (no arg) or set the panel title */
  title(value) {
    if (value === undefined) {
      return this.options.title;
    }
    this.options.title = value;
    this._titleEl.text(value);
    return this;
  },

  close() {
    if (typeof this.options.onClose === 'function') {
      this.options.onClose(this);
    }
    this.destroy();
    this.element.remove();
  },

  _onCloseClick(event) {
    event.preventDefault();
    this.close();
  },

  _onFocus() {
    if (typeof this.options.onFocus === 'function') {
      this.options.onFocus(this);
    }
  },

  _destroy() {
    if (this.options.draggable && this.element.data('ui-draggable')) {
      this.element.draggable('destroy');
    }
    this.element.removeClass('slx-panel slx-panel--draggable').empty();
  },
});

export default 'panel';
