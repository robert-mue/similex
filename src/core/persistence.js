/**
 * localStorage persistence for the workspace, exposed as `Similex.persistence`.
 * Stores the array produced by `workspace('serialize')` under a versioned key.
 * All access is guarded so a disabled/full/corrupt store (or a browser that
 * restricts storage on file://) degrades to "no persistence" rather than
 * throwing.
 */
(function (Similex) {
  'use strict';

  var KEY = 'similex.workspace.v1';

  Similex.persistence = {
    save: function (state) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (e) {
        /* storage unavailable or full — ignore */
      }
    },

    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        var parsed = raw ? JSON.parse(raw) : null;
        return Array.isArray(parsed) ? parsed : null;
      } catch (e) {
        return null;
      }
    },

    clear: function () {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {
        /* ignore */
      }
    },
  };
})(window.Similex);
