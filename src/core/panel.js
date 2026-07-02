/**
 * `similex.panel` — a workspace panel: a titlebar (title + minimise / maximise /
 * close controls) plus a content area hosting a dynamically loaded widget.
 *
 * Panels are absolutely positioned. The panel tracks its "normal" geometry
 * (position + size when neither minimised nor maximised) so those states can be
 * toggled and restored, and so the workspace can persist it.
 *
 * Usage:
 *   $('<div>').panel({ title: 'Clock' });
 *   $el.panel('content');              // -> jQuery of the content element
 *   $el.panel('title', 'New');         // get/set the title
 *   $el.panel('geometry');             // -> { left, top, width, height }
 *   $el.panel('minimize');             // toggle; or ('minimize', true|false)
 *   $el.panel('maximize');             // toggle; or ('maximize', true|false)
 */
import $ from './interactions.js';

$.widget('similex.panel', {
  options: {
    title: 'Panel',
    closable: true,
    draggable: true,
    resizable: true,
    minimizable: true,
    maximizable: true,
    /** @type {((panel: object) => void) | null} */
    onClose: null,
    /** Called when the panel is activated (e.g. clicked) — used to raise it. */
    onFocus: null,
    /** Called after geometry or min/max state changes — used to persist. */
    onChange: null,
  },

  _create() {
    this.element.addClass('slx-panel');
    this._minimized = false;
    this._maximized = false;
    // height null => content-driven until the panel is resized/restored.
    this._geom = { left: 0, top: 0, width: 260, height: null };

    this._titlebar = $('<div class="slx-panel-titlebar">').appendTo(
      this.element,
    );
    this._titleEl = $('<span class="slx-panel-title">')
      .text(this.options.title)
      .appendTo(this._titlebar);

    this._controls = $('<div class="slx-panel-controls">').appendTo(
      this._titlebar,
    );

    if (this.options.minimizable) {
      this._minBtn = this._controlButton('slx-panel-min').appendTo(
        this._controls,
      );
      this._on(this._minBtn, {
        click: (e) => {
          e.preventDefault();
          this.minimize();
        },
      });
    }
    if (this.options.maximizable) {
      this._maxBtn = this._controlButton('slx-panel-max').appendTo(
        this._controls,
      );
      this._on(this._maxBtn, {
        click: (e) => {
          e.preventDefault();
          this.maximize();
        },
      });
    }
    if (this.options.closable) {
      this._closeBtn = this._controlButton('slx-panel-close').appendTo(
        this._controls,
      );
      this._on(this._closeBtn, { click: '_onCloseClick' });
    }

    this._contentEl = $('<div class="slx-panel-content">').appendTo(
      this.element,
    );

    this._on(this.element, { mousedown: '_onFocus' });

    if (this.options.draggable) {
      this.element.addClass('slx-panel--draggable').draggable({
        handle: '.slx-panel-titlebar',
        cancel: '.slx-panel-controls',
        containment: 'parent',
        stack: '.slx-panel',
        stop: () => {
          if (!this._maximized) {
            this._geom.left = parseFloat(this.element.css('left')) || 0;
            this._geom.top = parseFloat(this.element.css('top')) || 0;
          }
          this._emitChange();
        },
      });
    }
    if (this.options.resizable) {
      this.element.resizable({
        handles: 'all',
        minWidth: 160,
        minHeight: 64,
        containment: 'parent',
        stop: () => {
          if (!this._maximized && !this._minimized) {
            this._geom = this._readGeometry();
          }
          this._emitChange();
        },
      });
    }

    this._updateButtons();
  },

  _controlButton(cls) {
    return $(`<button type="button" class="slx-panel-btn ${cls}">`);
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

  /** @returns {{left:number, top:number, width:number, height:number}} normal geometry */
  geometry() {
    return {
      left: this._geom.left,
      top: this._geom.top,
      width: this._geom.width ?? this.element.outerWidth(),
      // when height is content-driven, snapshot the actual rendered height
      height: this._geom.height ?? this.element.outerHeight(),
    };
  },

  /** Apply a normal geometry (position + size). */
  setGeometry(geom) {
    this._geom = {
      left: geom.left ?? this._geom.left,
      top: geom.top ?? this._geom.top,
      width: geom.width ?? this._geom.width,
      height: geom.height ?? this._geom.height,
    };
    if (!this._maximized && !this._minimized) {
      this._applyGeometry(this._geom);
    }
    return this;
  },

  minimized() {
    return this._minimized;
  },

  maximized() {
    return this._maximized;
  },

  /** Toggle (no arg) or set minimised state. Collapses to the titlebar. */
  minimize(on) {
    on = on === undefined ? !this._minimized : !!on;
    if (on === this._minimized) return this;
    if (on && this._maximized) this.maximize(false);

    this._minimized = on;
    this.element.toggleClass('slx-panel--minimized', on);
    if (on) {
      this.element.css('height', '');
      this._setResizableEnabled(false);
    } else {
      this.element.css('height', this._geom.height ?? '');
      this._setResizableEnabled(true);
    }
    this._updateButtons();
    this._emitChange();
    return this;
  },

  /** Toggle (no arg) or set maximised state. Fills the workspace. */
  maximize(on) {
    on = on === undefined ? !this._maximized : !!on;
    if (on === this._maximized) return this;
    if (on && this._minimized) this.minimize(false);

    this._maximized = on;
    this.element.toggleClass('slx-panel--maximized', on);
    if (on) {
      this.element.css({ left: 0, top: 0, width: '100%', height: '100%' });
      this._setDraggableEnabled(false);
      this._setResizableEnabled(false);
    } else {
      this._applyGeometry(this._geom);
      this._setDraggableEnabled(true);
      this._setResizableEnabled(true);
    }
    this._updateButtons();
    this._emitChange();
    return this;
  },

  close() {
    if (typeof this.options.onClose === 'function') {
      this.options.onClose(this);
    }
    this.destroy();
    this.element.remove();
  },

  _readGeometry() {
    return {
      left: parseFloat(this.element.css('left')) || 0,
      top: parseFloat(this.element.css('top')) || 0,
      width: this.element.outerWidth(),
      height: this.element.outerHeight(),
    };
  },

  _applyGeometry(g) {
    this.element.css({
      left: g.left,
      top: g.top,
      width: g.width ?? '',
      height: g.height ?? '',
    });
  },

  _setDraggableEnabled(on) {
    if (this.options.draggable && this.element.data('ui-draggable')) {
      this.element.draggable(on ? 'enable' : 'disable');
    }
  },

  _setResizableEnabled(on) {
    if (this.options.resizable && this.element.data('ui-resizable')) {
      this.element.resizable(on ? 'enable' : 'disable');
    }
  },

  _updateButtons() {
    if (this._minBtn) {
      this._minBtn
        .attr('aria-label', this._minimized ? 'Restore' : 'Minimize')
        .attr('title', this._minimized ? 'Restore' : 'Minimize');
    }
    if (this._maxBtn) {
      this._maxBtn
        .attr('aria-label', this._maximized ? 'Restore' : 'Maximize')
        .attr('title', this._maximized ? 'Restore' : 'Maximize')
        .toggleClass('slx-panel-restore', this._maximized);
    }
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

  _emitChange() {
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(this);
    }
  },

  _destroy() {
    if (this.options.draggable && this.element.data('ui-draggable')) {
      this.element.draggable('destroy');
    }
    if (this.options.resizable && this.element.data('ui-resizable')) {
      this.element.resizable('destroy');
    }
    this.element
      .removeClass(
        'slx-panel slx-panel--draggable slx-panel--minimized slx-panel--maximized',
      )
      .empty();
  },
});

export default 'panel';
