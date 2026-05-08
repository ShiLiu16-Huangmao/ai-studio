// @ai-radio/prompts — Prompt template engine

import type { PromptTemplate, PromptContext, RenderedPrompt } from './types';

export class PromptEngine {
  private templates = new Map<string, PromptTemplate>();

  /** Register a template from raw markdown content */
  register(name: string, content: string): void {
    const variables = this.extractVariables(content);
    this.templates.set(name, {
      name,
      path: `prompts/${name}.md`,
      content,
      variables,
    });
  }

  /** Remove a registered template */
  unregister(name: string): void {
    this.templates.delete(name);
  }

  /** Get a specific template by name */
  get(name: string): PromptTemplate | undefined {
    return this.templates.get(name);
  }

  /** Render a template with context variables */
  render(name: string, context: PromptContext = {}): RenderedPrompt {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template "${name}" not found`);
    }

    let content = template.content;

    // Simple {{variable}} replacement
    for (const variable of template.variables) {
      const value = this.resolveVariable(variable, context);
      content = content.replaceAll(`{{${variable}}}`, value);
    }

    return {
      systemPrompt: content,
      dynamicContext: this.buildDynamicContext(context),
    };
  }

  /** List all registered template names */
  list(): string[] {
    return Array.from(this.templates.keys());
  }

  // ==================== Private ====================

  private extractVariables(content: string): string[] {
    const matches = content.matchAll(/\{\{(\w+)\}\}/g);
    const vars = new Set<string>();
    for (const match of matches) {
      const varName = match[1];
      if (varName) {
        vars.add(varName);
      }
    }
    return Array.from(vars);
  }

  private resolveVariable(name: string, context: PromptContext): string {
    // Check known variables
    switch (name) {
      case 'djName':
        return context.djName ?? '夜汐';
      case 'timeOfDay':
        return context.timeContext?.timeOfDay ?? '';
      case 'currentTime':
        return context.timeContext?.now ?? '';
      case 'dayOfWeek':
        return context.timeContext?.dayOfWeek ?? '';
      default:
        return '';
    }
  }

  private buildDynamicContext(context: PromptContext): string {
    const blocks: string[] = [];

    if (context.weather) {
      blocks.push(`【天气】${JSON.stringify(context.weather)}`);
    }

    if (context.schedule?.length) {
      blocks.push(`【日程】${JSON.stringify(context.schedule)}`);
    }

    if (context.memories?.length) {
      const memoryLines = context.memories.map(
        (m) => `- (${m.createdAt}) ${m.content}`,
      );
      blocks.push(`【相关记忆】\n${memoryLines.join('\n')}`);
    }

    if (context.userMood) {
      blocks.push(`【用户当前情绪】${context.userMood}`);
    }

    return blocks.join('\n\n');
  }
}
