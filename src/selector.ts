/**
 * Generate a stable CSS selector for a DOM element.
 * Priority: #id > tag.class > nth-child path
 */
export function generateSelector(el: Element): string {
  if (el.id) {
    return `#${CSS.escape(el.id)}`;
  }

  // Try tag + distinctive class
  if (el.classList.length > 0) {
    const tag = el.tagName.toLowerCase();
    const classSelector = `${tag}.${Array.from(el.classList).map(CSS.escape).join('.')}`;
    if (document.querySelectorAll(classSelector).length === 1) {
      return classSelector;
    }
  }

  // Build nth-child path
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase();
    const parent: Element | null = current.parentElement;

    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c: Element) => c.tagName === current!.tagName
      );
      if (siblings.length === 1) {
        parts.unshift(tag);
      } else {
        const index = siblings.indexOf(current) + 1;
        parts.unshift(`${tag}:nth-child(${index})`);
      }
    } else {
      parts.unshift(tag);
    }

    current = parent;
  }

  return parts.join(' > ');
}
