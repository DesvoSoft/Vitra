/**
 * Entry of the script-tag builds (dist/vitra.js, dist/vitra.min.js).
 * vitra.js attaches the API object to window.Vitra itself; bundling it as an
 * IIFE without a global name keeps `window.Vitra` the API object (not a module
 * namespace) and avoids the namespace wrapper.
 */
import './vitra.js';
