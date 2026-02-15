import { toString } from 'hast-util-to-string';
import type { Element, Parents, Root } from 'hast';
import rehypeParse from 'rehype-parse';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

type ProcessedArticleContent = {
  html: string;
  toc: TocItem[];
};

const ALLOWED_PRISM_ATTRS = ['data-line', 'dataLine', 'data-highlight', 'dataHighlight'];

function createHeadingSlug(value: string): string {
  const normalized = value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .toLowerCase();

  return normalized || 'section';
}

function createUniqueId(baseId: string, seen: Map<string, number>): string {
  const current = seen.get(baseId) ?? 0;
  const next = current + 1;
  seen.set(baseId, next);

  if (next === 1) {
    return baseId;
  }

  return `${baseId}-${next}`;
}

/**
 * カスタムrehypeプラグイン: <div data-filename> をunwrapし、ファイル名をcodeタグに転写
 */
function rehypeExtractFilenameWrapper() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      const dataFilename = node.properties?.dataFilename || node.properties?.['data-filename'];

      if (
        node.tagName === 'div' &&
        dataFilename &&
        typeof dataFilename === 'string' &&
        parent &&
        typeof index === 'number' &&
        'children' in parent
      ) {
        const filename = dataFilename;

        visit(node, 'element', (child: Element) => {
          if (child.tagName === 'pre') {
            visit(child, 'element', (codeNode: Element) => {
              if (codeNode.tagName === 'code') {
                codeNode.properties = {
                  ...(codeNode.properties ?? {}),
                  dataFile: filename,
                };
              }
            });
          }
        });

        parent.children.splice(index, 1, ...node.children);
      }
    });
  };
}

/**
 * カスタムrehypeプラグイン: コードブロックの前にタイトルバーを挿入
 */
function rehypeAddCodeTitle() {
  return (tree: Root) => {
    const nodesToProcess: Array<{
      parent: Parents;
      index: number;
      titleElement: Element;
    }> = [];

    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      if (
        node.tagName === 'pre' &&
        parent &&
        typeof index === 'number' &&
        'children' in parent
      ) {
        let title = '';
        visit(node, 'element', (child: Element) => {
          if (child.tagName === 'code' && child.properties) {
            const dataFile = child.properties.dataFile || child.properties['data-file'];

            if (dataFile && typeof dataFile === 'string') {
              title = dataFile;
            } else if (Array.isArray(child.properties.className)) {
              const langClass = child.properties.className.find((cls) =>
                typeof cls === 'string' && cls.startsWith('language-'),
              );
              if (langClass && typeof langClass === 'string') {
                title = langClass.replace('language-', '');
              }
            }
          }
        });

        if (title) {
          const titleElement: Element = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['rehype-code-title'],
            },
            children: [
              {
                type: 'text',
                value: title,
              },
            ],
          };
          nodesToProcess.push({ parent, index, titleElement });
        }
      }
    });

    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const { parent, index, titleElement } = nodesToProcess[i];
      if ('children' in parent) {
        parent.children.splice(index, 0, titleElement);
      }
    }
  };
}

/**
 * カスタムrehypeプラグイン: 行番号を追加
 */
function rehypeLineNumbers() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') {
        return;
      }

      const codeElement = node.children?.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      );
      if (!codeElement) {
        return;
      }

      for (const attr of ALLOWED_PRISM_ATTRS) {
        const value = (codeElement.properties as Record<string, unknown> | undefined)?.[attr];
        if (value === undefined) {
          continue;
        }
        const strValue =
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
            ? value
            : String(value);
        node.properties = {
          ...node.properties,
          [attr]: strValue,
        };
      }

      const className = node.properties?.className;
      if (Array.isArray(className)) {
        if (!className.includes('line-numbers')) {
          className.push('line-numbers');
        }
      } else {
        node.properties = {
          ...node.properties,
          className: ['line-numbers'],
        };
      }

      const codeText = toString(codeElement).replace(/\n+$/u, '');
      const lineCount = codeText === '' ? 1 : codeText.split('\n').length;

      const lineNumbersSpan: Element = {
        type: 'element',
        tagName: 'span',
        properties: {
          ariaHidden: 'true',
          className: ['line-numbers-rows'],
        },
        children: Array.from({ length: lineCount }, () => ({
          type: 'element',
          tagName: 'span',
          properties: {},
          children: [],
        })),
      };

      node.children.push(lineNumbersSpan);
    });
  };
}

function rehypeBuildToc(toc: TocItem[]) {
  return (tree: Root) => {
    const seenIds = new Map<string, number>();

    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') {
        return;
      }

      const text = toString(node).replace(/\s+/g, ' ').trim();
      if (!text) {
        return;
      }

      const currentId = typeof node.properties?.id === 'string' ? node.properties.id.trim() : '';
      const baseId = createHeadingSlug(currentId || text);
      const id = createUniqueId(baseId, seenIds);
      const level = Number(node.tagName[1]) as 2 | 3;

      node.properties = {
        ...(node.properties ?? {}),
        id,
      };

      toc.push({ id, text, level });
    });
  };
}

function createSanitizeSchema() {
  return {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      '*': [
        ...(defaultSchema.attributes?.['*'] || []),
        'className',
        'id',
        'dataFilename',
        'data-filename',
        'dataFile',
        'data-file',
        'dataCodeTitle',
        'data-code-title',
        'dataLine',
        'data-line',
        'dataHighlight',
        'data-highlight',
        'ariaHidden',
        'aria-hidden',
      ],
      pre: [
        ...(defaultSchema.attributes?.pre || []),
        'className',
        'dataLine',
        'data-line',
        'dataHighlight',
        'data-highlight',
      ],
      code: [
        ...(defaultSchema.attributes?.code || []),
        'className',
        'dataFile',
        'data-file',
        'dataCodeTitle',
        'data-code-title',
        'dataLine',
        'data-line',
        'dataHighlight',
        'data-highlight',
      ],
      span: [
        ...(defaultSchema.attributes?.span || []),
        'className',
        'ariaHidden',
        'aria-hidden',
      ],
      div: [
        ...(defaultSchema.attributes?.div || []),
        'className',
        'dataFilename',
        'data-filename',
      ],
      h2: [...(defaultSchema.attributes?.h2 || []), 'id'],
      h3: [...(defaultSchema.attributes?.h3 || []), 'id'],
    },
  };
}

export async function processArticleContentWithToc(content: string): Promise<ProcessedArticleContent> {
  const toc: TocItem[] = [];

  try {
    const file = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRaw)
      .use(rehypeSanitize, createSanitizeSchema())
      .use(rehypeExtractFilenameWrapper)
      .use(rehypePrismPlus, { ignoreMissing: true })
      .use(rehypeAddCodeTitle)
      .use(rehypeLineNumbers)
      .use(rehypeBuildToc, toc)
      .use(rehypeStringify)
      .process(content);

    return { html: String(file), toc };
  } catch (error) {
    console.error('Error processing article content with TOC:', error);
    return { html: content, toc: [] };
  }
}
