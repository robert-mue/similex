/**
 * `similex.hello` — a minimal example content widget.
 */
import $ from '../core/widget-base.js';

$.widget('similex.hello', {
  options: {
    name: 'world',
  },

  _create() {
    this.element.addClass('slx-hello');
    this._render();
  },

  _render() {
    this.element.text(`Hello, ${this.options.name}!`);
  },

  _setOption(key, value) {
    this._super(key, value);
    this._render();
  },

  _destroy() {
    this.element.removeClass('slx-hello').empty();
  },
});

export default 'hello';
