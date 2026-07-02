/**
 * Registry of dynamically loadable content widgets.
 *
 * A widget is registered under a name with a loader that returns a dynamic
 * `import()`. The imported module must self-register via `$.widget(...)` and
 * default-export the jQuery UI plugin method name to invoke on an element
 * (e.g. `export default 'clock'` for a widget created as
 * `$.widget('similex.clock', ...)`).
 *
 * This module deliberately has no jQuery dependency of its own — jQuery is only
 * pulled in lazily, when a widget module is actually imported.
 */

const registry = new Map();

/**
 * @param {string} name
 * @param {() => Promise<{ default: string }>} loader
 */
export function registerWidget(name, loader) {
  registry.set(name, loader);
}

/** @returns {string[]} names of all registered widgets */
export function registeredWidgets() {
  return [...registry.keys()];
}

/**
 * Dynamically import a widget and return its jQuery UI plugin method name.
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function loadWidget(name) {
  const loader = registry.get(name);
  if (!loader) {
    throw new Error(`Unknown widget: "${name}"`);
  }
  const mod = await loader();
  const method = mod.default;
  if (typeof method !== 'string') {
    throw new Error(
      `Widget "${name}" must default-export its jQuery UI method name`,
    );
  }
  return method;
}
