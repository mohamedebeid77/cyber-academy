import type { ContentBlock, CalloutVariant, DiagramId } from '../types';

const VALID_DIAGRAMS: DiagramId[] = [
  'android-architecture',
  'apk-anatomy',
  'activity-lifecycle',
  'app-api-flow',
  'frida-flow',
  'static-workflow',
  'dynamic-workflow',
  'cert-pinning-flow',
  'component-interaction',
  'binder-ipc',
  'masvs-map',
  'methodology-pipeline'
];

const VALID_CALLOUTS: CalloutVariant[] = ['info', 'tip', 'warn', 'danger', 'note', 'legal'];

export const LESSON_SYNTAX_HELP = `Write lesson content with a simple line-based syntax:

# Sub-heading
A plain line becomes a paragraph.
- A bullet list item
- Another bullet
1. An ordered list item

\`\`\`bash
adb devices
\`\`\`

> [!TIP] Optional title
> Callout text (variants: TIP, INFO, WARN, DANGER, NOTE, LEGAL)

diagram:android-architecture | Optional caption`;

export function parseLessonSource(src: string): { blocks: ContentBlock[]; errors: string[] } {
  const blocks: ContentBlock[] = [];
  const errors: string[] = [];
  const lines = src.split(/\r?\n/);
  let i = 0;

  const flushList = (items: string[], ordered: boolean) => {
    if (items.length > 0) blocks.push({ type: 'list', items, ordered });
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h', text: line.slice(2).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const meta = line.slice(3).trim();
      const [lang, ...titleParts] = meta.split(':');
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) errors.push(`Unclosed code fence near "${meta}".`);
      i += 1; // closing fence
      blocks.push({ type: 'code', lang: (lang || 'text').trim(), code: codeLines.join('\n'), title: titleParts.join(':').trim() || undefined });
      continue;
    }

    if (line.startsWith('> ')) {
      const header = line.slice(2).trim();
      const m = header.match(/^\[!([A-Z]+)\]\s*(.*)$/i);
      if (m) {
        const variant = m[1].toLowerCase() as CalloutVariant;
        if (!VALID_CALLOUTS.includes(variant)) errors.push(`Unknown callout variant [!${m[1]}]. Use TIP, INFO, WARN, DANGER, NOTE or LEGAL.`);
        const textLines = [m[2]];
        i += 1;
        while (i < lines.length && lines[i].startsWith('> ')) {
          textLines.push(lines[i].slice(2));
          i += 1;
        }
        blocks.push({ type: 'callout', variant, text: textLines.filter(Boolean).join(' ') });
        continue;
      }
      errors.push(`Callout lines must start with "> [!TIP]" style tags. Got: "${header.slice(0, 30)}"`);
      i += 1;
      continue;
    }

    if (line.startsWith('diagram:')) {
      const rest = line.slice(8);
      const [id, ...cap] = rest.split('|');
      const idTrim = id.trim();
      if (!VALID_DIAGRAMS.includes(idTrim as DiagramId)) {
        errors.push(`Unknown diagram "${idTrim}". Valid: ${VALID_DIAGRAMS.join(', ')}`);
      } else {
        blocks.push({ type: 'diagram', id: idTrim as DiagramId, caption: cap.join('|').trim() || undefined });
      }
      i += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2).trim());
        i += 1;
      }
      flushList(items, false);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim());
        i += 1;
      }
      flushList(items, true);
      continue;
    }

    blocks.push({ type: 'p', text: line.trim() });
    i += 1;
  }

  return { blocks, errors };
}

export function serializeBlocks(blocks: ContentBlock[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'p':
        out.push(b.text, '');
        break;
      case 'h':
        out.push(`# ${b.text}`, '');
        break;
      case 'list':
        b.items.forEach((it, idx) => out.push(b.ordered ? `${idx + 1}. ${it}` : `- ${it}`));
        out.push('');
        break;
      case 'code':
        out.push('```' + b.lang + (b.title ? `:${b.title}` : ''), b.code, '```', '');
        break;
      case 'terminal':
        out.push('```terminal', ...b.lines, '```', '');
        break;
      case 'callout':
        out.push(`> [!${b.variant.toUpperCase()}]${b.title ? ' ' + b.title : ''}`, `> ${b.text}`, '');
        break;
      case 'diagram':
        out.push(`diagram:${b.id}${b.caption ? ' | ' + b.caption : ''}`, '');
        break;
      case 'compare':
        out.push(
          '```before',
          b.beforeCode,
          '```',
          '```after',
          b.afterCode,
          '```',
          ''
        );
        break;
    }
  }
  return out.join('\n').trim();
}
