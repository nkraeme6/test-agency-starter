import Markdoc from '@markdoc/markdoc';

/**
 * Keystatic's `fields.markdoc()` field returns `{ node: MarkdocNode }` when
 * read via the Reader API — not a ready-to-render component. This turns
 * that AST node into an HTML string we can inject with `set:html` in an
 * Astro template.
 *
 * If you need custom Markdoc tags/components later, extend the `config`
 * object passed to `Markdoc.transform` here (see markdoc.dev/docs/tags).
 */
export function renderMarkdoc(node: unknown): string {
  if (!node) return '';
  const transformed = Markdoc.transform(node as any, {});
  return Markdoc.renderers.html(transformed);
}
