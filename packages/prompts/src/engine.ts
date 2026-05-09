// @ai-radio/prompts — Template engine (variable replacement)
// ===================================================================

/**
 * Simple template engine that replaces {{variable}} placeholders
 * with values from a context object.
 *
 * Example:
 *   render("你好 {{name}}，今天是{{day}}", { name: "夜汐", day: "周三" })
 *   → "你好 夜汐，今天是周三"
 */
export function renderTemplate(
  template: string,
  ctx: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(ctx)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

/**
 * Extract all {{variable}} names from a template string.
 */
export function extractVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  const vars = new Set<string>();
  for (const match of matches) {
    const name = match[1];
    if (name) vars.add(name);
  }
  return Array.from(vars);
}

/**
 * Compute block separator based on position in the prompt.
 * Early blocks get heavier separators, later blocks are more compact.
 */
export function separator(index: number, total: number): string {
  if (index === 0) return '';
  if (index === 1) return '\n\n---\n\n';
  if (index === total - 1) return '\n\n';
  return '\n\n---\n';
}
