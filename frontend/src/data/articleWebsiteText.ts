export type ArticleTextNode = { type: string; value?: string; children?: ArticleTextNode[] };

// Match replacement units to Markdown text nodes; formatting and destinations stay separate.
export function articleTextSegments(value: string): string[] {
  const segments: string[] = [];
  while (value.length > 5000) {
    const boundary = value.lastIndexOf(" ", 5000);
    const end = boundary > 0 ? boundary + 1 : 5000;
    segments.push(value.slice(0, end)); value = value.slice(end);
  }
  if (value) segments.push(value);
  return segments;
}

export function articleTextSources(tree: ArticleTextNode): string[] {
  const sources: string[] = [];
  function visit(node: ArticleTextNode) {
    if (node.type === "text" && node.value) sources.push(...articleTextSegments(node.value));
    node.children?.forEach(visit);
  }
  visit(tree); return sources;
}

export function replaceArticleTextNodes(tree: ArticleTextNode, replace: (text: string) => string) {
  function visit(node: ArticleTextNode) {
    if (node.type === "text" && node.value) node.value = articleTextSegments(node.value).map(replace).join("");
    node.children?.forEach(visit);
  }
  visit(tree);
}
