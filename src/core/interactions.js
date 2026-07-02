/**
 * Loads jQuery UI's `draggable` and `resizable` widgets together with their
 * shared dependency chain.
 *
 * jQuery UI's UMD build does not resolve its own inter-module deps when a single
 * widget file is imported directly, so we import the whole chain explicitly, in
 * dependency order, after `widget-base.js` (which installs the global jQuery +
 * widget factory). Per the module headers:
 *   mouse     ← version, widget
 *   draggable ← mouse, data, plugin, scroll-parent, version, widget
 *   resizable ← mouse, disable-selection, plugin, version, widget
 *
 * NOTE: jQuery UI resizable relies on handle-placement CSS (normally from
 * jquery-ui.css). We ship the minimal handle rules ourselves in styles.css —
 * without them the resize handles have zero size and can't be grabbed.
 */
import $ from './widget-base.js';
import 'jquery-ui/ui/version.js';
import 'jquery-ui/ui/widgets/mouse.js';
import 'jquery-ui/ui/data.js';
import 'jquery-ui/ui/plugin.js';
import 'jquery-ui/ui/scroll-parent.js';
import 'jquery-ui/ui/disable-selection.js';
import 'jquery-ui/ui/widgets/draggable.js';
import 'jquery-ui/ui/widgets/resizable.js';

export default $;
