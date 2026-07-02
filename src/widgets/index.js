/**
 * Built-in content widgets. Each is registered with a lazy loader so the
 * widget's code (and jQuery UI dependency) is only fetched when first opened.
 *
 * To add a widget: create `src/widgets/<name>.js` that calls
 * `$.widget('similex.<name>', {...})` and `export default '<name>'`, then
 * register its loader here.
 */
import { registerWidget } from '../core/widget-registry.js';

registerWidget('clock', () => import('./clock.js'));
registerWidget('hello', () => import('./hello.js'));
registerWidget('counter', () => import('./counter.js'));
registerWidget('notepad', () => import('./notepad.js'));
registerWidget('colorpicker', () => import('./colorpicker.js'));
