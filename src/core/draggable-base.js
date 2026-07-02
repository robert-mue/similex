/**
 * Loads jQuery UI's `draggable` widget together with its dependency chain.
 *
 * jQuery UI's UMD build does not resolve its own inter-module deps when a single
 * file is imported directly — `draggable.js` assumes `$.ui.mouse`, `$.ui.plugin`
 * etc. are already present. So we import the chain explicitly, in dependency
 * order, after `widget-base.js` (which installs the global jQuery + widget
 * factory). Per the module headers:
 *   mouse    ← version, widget
 *   draggable ← mouse, data, plugin, scroll-parent, version, widget
 */
import $ from './widget-base.js';
import 'jquery-ui/ui/version.js';
import 'jquery-ui/ui/widgets/mouse.js';
import 'jquery-ui/ui/data.js';
import 'jquery-ui/ui/plugin.js';
import 'jquery-ui/ui/scroll-parent.js';
import 'jquery-ui/ui/widgets/draggable.js';

export default $;
