/**
 * `similex.counter` — increment/decrement counter, emits a `counterchange`
 * event whenever the value changes.
 */
import $ from '../core/widget-base.js';

$.widget('similex.counter', {
  options: {
    start: 0,
    step: 1,
  },

  _create() {
    this.element.addClass('slx-counter');
    this._count = this.options.start;

    this._valueEl = $('<span class="slx-counter-value">').appendTo(
      this.element,
    );
    const $controls = $('<div class="slx-counter-controls">').appendTo(
      this.element,
    );
    this._decBtn = $(
      '<button type="button" aria-label="Decrement">&minus;</button>',
    ).appendTo($controls);
    this._incBtn = $(
      '<button type="button" aria-label="Increment">+</button>',
    ).appendTo($controls);

    this._on(this._decBtn, { click: () => this._bump(-this.options.step) });
    this._on(this._incBtn, { click: () => this._bump(this.options.step) });

    this._render();
  },

  /** @returns {number} current value */
  value() {
    return this._count;
  },

  _bump(delta) {
    this._count += delta;
    this._render();
    this._trigger('change', null, { value: this._count });
  },

  _render() {
    this._valueEl.text(this._count);
  },

  _destroy() {
    this.element.removeClass('slx-counter').empty();
  },
});

export default 'counter';
