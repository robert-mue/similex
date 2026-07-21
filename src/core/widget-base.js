/**
 * `$.similex.widgetBase` — an optional base for content widgets that bind to a
 * model. Extend it instead of the bare widget factory:
 *
 *     $.widget('similex.counter', $.similex.widgetBase, { ...widget... });
 *
 * It gives a widget three things, so the whole authoring contract is one
 * sentence — *put shared data in the model via `_set`, and wrap user actions in
 * `_action`*:
 *
 *   - Model access scoped to the host panel's `ref` (the path this panel is a
 *     view of): `_ref()` / `_bound()` / `_model()` / `_get(sub)` / `_set(sub,v)`.
 *     When the panel has no `ref` the widget is "unbound" and these no-op — the
 *     widget should fall back to local/option state.
 *   - `_action(name, payload, run)` — dispatch a logged action `'<widget>.<name>'`
 *     targeting the host panel; `run`'s userData changes are captured by the
 *     transaction (undo/replay), all for free.
 *
 * It deliberately does NOT subscribe the widget to its model. Re-rendering when
 * the *model* changes underneath the widget (so sibling panels sharing a `ref`
 * update together, and so undo shows visibly) is the separate pub/sub step —
 * added only when asked.
 *
 * Classic script. Load after `actions.js`, before any widget is injected.
 */
(function ($, Similex) {
  'use strict';

  $.widget('similex.widgetBase', {
    /** The host panel element (the `.slx-panel` ancestor of the content div). */
    _panel: function () {
      if (!this._panelEl || !this._panelEl.length) {
        this._panelEl = this.element.closest('.slx-panel');
      }
      return this._panelEl;
    },

    /** @returns {?string} the host panel's id, or null if not in a panel */
    _panelId: function () {
      var $p = this._panel();
      return $p.length ? $p.panel('id') : null;
    },

    /** @returns {string} the model path this widget views ('' when unbound) */
    _ref: function () {
      var $p = this._panel();
      return $p.length ? $p.panel('ref') || '' : '';
    },

    /** @returns {boolean} whether the widget is bound to a model */
    _bound: function () {
      return !!this._ref();
    },

    /** @returns the whole model object (undefined when unbound) */
    _model: function () {
      return this._bound() ? Similex.userData.get(this._ref()) : undefined;
    },

    /** Read a property under the model ('sub'), or the whole model (no arg). */
    _get: function (sub) {
      var r = this._ref();
      if (!r) return undefined;
      return Similex.userData.get(sub ? r + '/' + sub : r);
    },

    /** Write a property under the model; no-op (returns undefined) when unbound. */
    _set: function (sub, value) {
      var r = this._ref();
      if (!r) return undefined;
      return Similex.userData.set(sub ? r + '/' + sub : r, value);
    },

    /**
     * Dispatch a logged user action named '<widgetName>.<name>' targeting the
     * host panel. `run` performs the effect; its userData changes are captured.
     */
    _action: function (name, payload, run) {
      var type = this.widgetName + '.' + name;
      if (Similex.actions) {
        return Similex.actions.dispatch(
          { type: type, target: this._panelId(), payload: payload || {} },
          run,
        );
      }
      if (typeof run === 'function') run();
      return null;
    },
  });
})(window.jQuery, window.Similex);
