/**
 * `similex.workspace` — the region that holds panels. Panels are added
 * imperatively; each hosts a dynamically loaded content widget.
 *
 * The workspace keeps a metadata entry per panel (widget name, title, options)
 * so the whole workspace can be serialised to a plain array and restored later.
 * It calls `onChange` whenever a panel is added, removed, moved, resized, or
 * min/maximised — the hook the app uses to persist.
 *
 * Usage:
 *   $('<div>').workspace({ onChange });
 *   await $ws.workspace('addPanel', { title, widget, options });
 *   const state = $ws.workspace('serialize');
 *   await $ws.workspace('restore', state);
 *   $ws.workspace('clear');
 */
import $ from './widget-base.js';
import './panel.js';
import { loadWidget } from './widget-registry.js';

$.widget('similex.workspace', {
  options: {
    /** @type {(() => void) | null} */
    onChange: null,
  },

  _create() {
    this.element.addClass('slx-workspace');
    /** @type {Array<{$panel: JQuery, widget?: string, method: ?string, title: string, options: object}>} */
    this._entries = [];
    this._z = 0;
    this._spawnCount = 0;
    this._suspend = false;
  },

  /**
   * @param {{ title?: string, widget?: string, options?: object,
   *           closable?: boolean, draggable?: boolean, resizable?: boolean,
   *           minimizable?: boolean, maximizable?: boolean,
   *           geometry?: object, minimized?: boolean, maximized?: boolean }} config
   * @returns {Promise<JQuery>} the panel element
   */
  async addPanel(config = {}) {
    const {
      title = 'Panel',
      widget,
      options = {},
      closable = true,
      draggable = true,
      resizable = true,
      minimizable = true,
      maximizable = true,
      geometry,
      minimized = false,
      maximized = false,
    } = config;

    const $panel = $('<div>').appendTo(this.element);
    $panel.panel({
      title,
      closable,
      draggable,
      resizable,
      minimizable,
      maximizable,
      onClose: () => {
        this._forget($panel);
        this._emitChange();
      },
      onFocus: () => this._raise($panel),
      onChange: () => this._emitChange(),
    });

    if (geometry) {
      $panel.panel('setGeometry', geometry);
    } else {
      this._place($panel);
    }
    this._raise($panel);

    const entry = {
      $panel,
      widget,
      method: null,
      title,
      options: { ...options },
    };
    this._entries.push(entry);

    if (widget) {
      const method = await loadWidget(widget);
      entry.method = method;
      $panel.panel('content')[method]({ ...options });
    }

    if (minimized) $panel.panel('minimize', true);
    if (maximized) $panel.panel('maximize', true);

    this._emitChange();
    return $panel;
  },

  /** @returns {JQuery[]} currently open panels */
  panels() {
    return this._entries.map((e) => e.$panel);
  },

  /**
   * Snapshot every panel (widget, title, merged options + widget state,
   * geometry, min/max flags) as a plain, JSON-serialisable array.
   */
  serialize() {
    return this._entries
      .filter((e) => e.$panel[0].isConnected)
      .map((e) => {
        const inst = e.method
          ? e.$panel.panel('content')[e.method]('instance')
          : null;
        const state =
          inst && typeof inst.state === 'function' ? inst.state() : {};
        return {
          widget: e.widget,
          title: e.title,
          options: { ...e.options, ...state },
          geometry: e.$panel.panel('geometry'),
          minimized: e.$panel.panel('minimized'),
          maximized: e.$panel.panel('maximized'),
        };
      });
  },

  /** Rebuild the workspace from a serialised array (replaces current panels). */
  async restore(list) {
    this.clear();
    this._suspend = true;
    try {
      for (const item of list) {
        await this.addPanel(item);
      }
    } finally {
      this._suspend = false;
    }
    this._emitChange();
  },

  clear() {
    for (const $panel of this.panels()) {
      $panel.panel('close');
    }
    this._entries = [];
  },

  /** Cascade panels so a fresh one is offset from the last. */
  _place($panel) {
    const gap = 28;
    const step = this._spawnCount % 8;
    this._spawnCount += 1;
    $panel.panel('setGeometry', {
      left: 16 + step * gap,
      top: 16 + step * gap,
    });
  },

  /** Bring a panel to the front. */
  _raise($panel) {
    this._z += 1;
    $panel.css('z-index', this._z);
  },

  _forget($panel) {
    this._entries = this._entries.filter((e) => e.$panel[0] !== $panel[0]);
  },

  _emitChange() {
    if (this._suspend) return;
    if (typeof this.options.onChange === 'function') {
      this.options.onChange();
    }
  },

  _destroy() {
    this.clear();
    this.element.removeClass('slx-workspace').empty();
  },
});

export default 'workspace';
