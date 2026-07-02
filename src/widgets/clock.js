/**
 * `similex.clock` — a live clock content widget.
 */
import $ from '../core/widget-base.js';

$.widget('similex.clock', {
  options: {
    hour12: false,
  },

  _create() {
    this.element.addClass('slx-clock');
    this._render();
    this._timer = setInterval(() => this._render(), 1000);
  },

  _render() {
    this.element.text(
      new Date().toLocaleTimeString([], { hour12: this.options.hour12 }),
    );
  },

  _setOption(key, value) {
    this._super(key, value);
    this._render();
  },

  _destroy() {
    clearInterval(this._timer);
    this.element.removeClass('slx-clock').empty();
  },
});

export default 'clock';
