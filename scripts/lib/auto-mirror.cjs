/**
 * Generates the `auto` theme from the `light` and `dark` rules.
 *
 * The author marks a rule with the comment
 *   /* @vitra-auto-mirror light *\/   (or `dark`)
 * right before it. mirrorAuto() keeps the rule and inserts, right after it and
 * in the same container (cascade layer), a copy wrapped in
 * `@media (prefers-color-scheme: light|dark)` whose selector targets
 * `[data-theme="auto"]` instead of the marked theme. Only the theme attribute
 * changes, so the copy has exactly the specificity of the original:
 *   - in a selector list, only the selectors naming the theme are kept;
 *   - inside :where() / :is(), the whole list of theme attributes is replaced;
 *   - everything else in the selector (html, descendants, pseudo-elements) and
 *     all declarations are copied verbatim.
 * The marker comment is removed from the output.
 */
const postcss = require('postcss');

const MARKER = /^\s*@vitra-auto-mirror(?:\s+(\S+))?\s*$/;
const SCHEMES = ['light', 'dark'];
const THEME_ATTR = /\[\s*data-theme\s*=\s*(["'])([^"']*)\1\s*\]/g;

/** Split a selector list on top-level commas (not inside (), [] or strings). */
function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

const themesIn = (text) => [...text.matchAll(THEME_ATTR)].map((m) => m[2]);

/** Index of the parenthesis closing the one opened at `open`. */
function closingParen(text, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i;
  }
  throw new Error(`mirrorAuto: unbalanced parenthesis in selector "${text}"`);
}

/** Rewrite one complex selector; returns null when it does not name `theme`. */
function rewriteSelector(selector, theme) {
  if (!themesIn(selector).includes(theme)) return null;
  let out = '';
  let i = 0;
  const re = /:(where|is)\(/g;
  for (let m; (m = re.exec(selector)); ) {
    const open = m.index + m[0].length - 1;
    const close = closingParen(selector, open);
    const inner = selector.slice(open + 1, close);
    if (themesIn(inner).length) {
      out += selector.slice(i, open + 1) + '[data-theme="auto"]' + ')';
      i = close + 1;
      re.lastIndex = i;
    }
  }
  out += selector.slice(i);
  // Whatever theme attribute is left sits outside :where()/:is().
  return out.replace(THEME_ATTR, '[data-theme="auto"]');
}

/** Add two spaces after every newline of the raw whitespace of a subtree. */
function indent(node) {
  const bump = (s) => (typeof s === 'string' ? s.replace(/\n/g, '\n  ') : s);
  node.raws.before = bump(node.raws.before);
  node.raws.after = bump(node.raws.after);
  node.raws.between = bump(node.raws.between);
  if (node.nodes) node.each(indent);
}

function mirrorAuto(css) {
  const root = postcss.parse(css);
  const markers = [];
  root.walkComments((c) => {
    const m = MARKER.exec(c.text);
    if (m) markers.push([c, m[1]]);
  });

  for (const [comment, scheme] of markers) {
    if (!SCHEMES.includes(scheme)) {
      throw new Error(`mirrorAuto: marker must name light or dark, got "${scheme}"`);
    }
    const rule = comment.next();
    if (!rule || rule.type !== 'rule') {
      throw new Error(`mirrorAuto: marker "${scheme}" is not followed by a rule`);
    }
    const selectors = splitTopLevel(rule.selector)
      .map((s) => rewriteSelector(s, scheme))
      .filter((s) => s !== null);
    if (!selectors.length) {
      throw new Error(`mirrorAuto: rule "${rule.selector}" has no [data-theme="${scheme}"]`);
    }

    const copy = rule.clone({ selector: selectors.join(', ') });
    copy.raws.before = '\n    ';
    indent(copy);
    copy.raws.before = '\n    ';
    const media = postcss.atRule({ name: 'media', params: `(prefers-color-scheme: ${scheme})` });
    media.raws.before = rule.raws.before;
    media.raws.between = ' ';
    media.raws.afterName = ' ';
    media.raws.after = '\n  ';
    media.append(copy);
    rule.after(media);
    comment.remove();
  }
  return root.toString();
}

module.exports = { mirrorAuto };
