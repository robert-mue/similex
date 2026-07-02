/**
 * `similex.workspace` — the region that holds panels. Panels are added
 * imperatively; each hosts a dynamically loaded content widget.
 *
 * Usage:
 *   $('<div>').workspace();
 *   await $ws.workspace('addPanel', { title, widget, options });
 *   $ws.workspace('clear');
 */
import $ from './widget-base.js';
import './panel.js';
import { loadWidget } from './widget-registry.js';

$.widget('similex.workspace', {
  options: {},

  _create() {
    this.element.addClass('slx-workspace');
    /** @type {JQuery[]} */
    this._panels = [];
    this._z = 0;
    this._spawnCount = 0;
  },

  /**
   * @param {{ title?: string, widget?: string, options?: object,
   *           closable?: boolean, draggable?: boolean }} config
   * @returns {Promise<JQuery>} the panel element
   */
  async addPanel(config = {}) {
    const {
      title = 'Panel',
      widget,
      options = {},
      closable = true,
      draggable = true,
    } = config;

    const $panel = $('<div>').appendTo(this.element);
    $panel.panel({
      title,
      closable,
      draggable,
      onClose: () => this._forget($panel),
      onFocus: () => this._raise($panel),
    });
    this._place($panel);
    this._raise($panel);
    this._panels.push($panel);

    if (widget) {
      const method = await loadWidget(widget);
      $panel.panel('content')[method](options);
    }

    return $panel;
  },

  /** @returns {JQuery[]} currently open panels */
  panels() {
    return [...this._panels];
  },

  clear() {
    for (const $panel of [...this._panels]) {
      $panel.panel('close');
    }
    this._panels = [];
  },

  /** Cascade panels so a fresh one is offset from the last. */
  _place($panel) {
    const gap = 28;
    const step = this._spawnCount % 8;
    this._spawnCount += 1;
    $panel.css({
      position: 'absolute',
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
    this._panels = this._panels.filter((p) => p[0] !== $panel[0]);
  },

  _destroy() {
    this.clear();
    this.element.removeClass('slx-workspace').empty();
  },
});

export default 'workspace';
