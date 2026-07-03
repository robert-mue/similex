/**
 * Registry of dynamically loadable content widgets, exposed as
 * `Similex.widgetRegistry`.
 *
 * Because the app runs from file:// with no bundler, dynamic loading is done by
 * INJECTING a classic <script> tag (ES `import()` is blocked over file://).
 * Each widget is registered with the URL of its script. On first use the script
 * is injected; when it runs it self-registers via `$.widget(...)` and calls
 * `Similex.widgetRegistry._loaded(name, method)` to record the jQuery UI plugin
 * method name to invoke on a panel's content element.
 */
(function (Similex) {
  'use strict';

  var registry = {}; // name -> { src, method, promise }

  Similex.widgetRegistry = {
    /** @param {string} name @param {string} src script URL, relative to index.html */
    register: function (name, src) {
      registry[name] = { src: src, method: null, promise: null };
    },

    /** @returns {string[]} names of all registered widgets */
    names: function () {
      return Object.keys(registry);
    },

    /** Called by a widget script once loaded, to record its plugin method name. */
    _loaded: function (name, method) {
      if (registry[name]) {
        registry[name].method = method;
      }
    },

    /**
     * Dynamically load a widget and resolve to its jQuery UI plugin method name.
     * @param {string} name
     * @returns {Promise<string>}
     */
    loadWidget: function (name) {
      var entry = registry[name];
      if (!entry) {
        return Promise.reject(new Error('Unknown widget: "' + name + '"'));
      }
      if (entry.method) {
        return Promise.resolve(entry.method);
      }
      if (entry.promise) {
        return entry.promise;
      }
      entry.promise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = entry.src;
        script.onload = function () {
          if (entry.method) {
            resolve(entry.method);
          } else {
            reject(
              new Error(
                'Widget "' +
                  name +
                  '" loaded but did not register a method name',
              ),
            );
          }
        };
        script.onerror = function () {
          entry.promise = null;
          reject(new Error('Failed to load widget script: ' + entry.src));
        };
        document.head.appendChild(script);
      });
      return entry.promise;
    },
  };
})(window.Similex);
