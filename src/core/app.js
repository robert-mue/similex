/**
 * App — composes the SPA out of a customisable menu and a panel workspace,
 * both mounted inside a single root element.
 */
import $ from './widget-base.js';
import './menu.js';
import './workspace.js';

export class App {
  /**
   * @param {string | Element | JQuery} root  where to mount the app
   * @param {{ items?: Array }} [menu]  initial menu config
   */
  constructor(root, { items = [] } = {}) {
    this.$root = $(root).addClass('slx-app');
    this.$menu = $('<div class="slx-app-menu">')
      .appendTo(this.$root)
      .menu({ items });
    this.$workspace = $('<div class="slx-app-workspace">')
      .appendTo(this.$root)
      .workspace();
  }

  /** Replace the menu items. */
  setMenu(items) {
    this.$menu.menu('items', items);
    return this;
  }

  /** Open a panel hosting a dynamically loaded widget. */
  addPanel(config) {
    return this.$workspace.workspace('addPanel', config);
  }

  /** Remove every open panel. */
  clearWorkspace() {
    this.$workspace.workspace('clear');
    return this;
  }
}
