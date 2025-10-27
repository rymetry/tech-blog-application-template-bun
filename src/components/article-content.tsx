import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';
import { toString } from 'hast-util-to-string';
import type { Root, Element, Parents } from 'hast';
import { visit } from 'unist-util-visit';

interface ArticleContentProps {
  content: string;
}

/**
 * カスタムrehypeプラグイン: <div data-filename> をunwrapし、ファイル名をcodeタグに転写
 */
function rehypeExtractFilenameWrapper() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      // data-filename属性をチェック（キャメルケース・ケバブケース両対応）
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
        
        // div内のpreタグを探す
        visit(node, 'element', (child: Element) => {
          if (child.tagName === 'pre') {
            // pre内のcodeタグを探す
            visit(child, 'element', (codeNode: Element) => {
              if (codeNode.tagName === 'code') {
                // ファイル名をdata-file属性として追加
                codeNode.properties = codeNode.properties || {};
                codeNode.properties.dataFile = filename;
              }
            });
          }
        });

        // div要素を子要素で置き換え（unwrap）
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
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      if (
        node.tagName === 'pre' &&
        parent &&
        typeof index === 'number' &&
        'children' in parent
      ) {
        // pre内のcodeタグを探す
        let title = '';
        visit(node, 'element', (child: Element) => {
          if (child.tagName === 'code' && child.properties) {
            const dataFile = child.properties.dataFile || child.properties['data-file'];
            
            // ファイル名がある場合は優先
            if (dataFile && typeof dataFile === 'string') {
              title = dataFile;
            } else if (Array.isArray(child.properties.className)) {
              // 言語クラスから言語名を抽出
              const langClass = child.properties.className.find((cls) => 
                typeof cls === 'string' && cls.startsWith('language-')
              );
              if (langClass && typeof langClass === 'string') {
                const lang = langClass.replace('language-', '');
                title = lang;
              }
            }
          }
        });

        // タイトルがある場合、タイトル要素を生成してpreの前に挿入
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
          
          // タイトル要素をpreの前に挿入
          parent.children.splice(index, 0, titleElement);
          return index + 2; // 次のインデックスをスキップ（タイトル要素とpre要素）
        }
      }
    });
  };
}

/**
 * カスタムrehypeプラグイン: 行番号を追加
 */
const ALLOWED_PRISM_ATTRS = ['data-line', 'dataLine', 'data-highlight', 'dataHighlight'];

function rehypeLineNumbers() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') {
        return;
      }

      const code = node.children?.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      );
      if (!code) {
        return;
      }

      // Prism のハイライト用属性を pre に引き継ぐ
      for (const attr of ALLOWED_PRISM_ATTRS) {
        const value = (code.properties as Record<string, unknown> | undefined)?.[attr];
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

      let codeElement: Element | undefined;
      visit(node, 'element', (child: Element) => {
        if (child.tagName === 'code') {
          codeElement = child;
        }
      });

      if (!codeElement) {
        return;
      }

      let codeText = toString(codeElement);
      codeText = codeText.replace(/\n+$/u, '');
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

/**
 * ArticleContentコンポーネント: microCMSから取得したHTMLを安全に整形・ハイライト表示
 */
export async function ArticleContent({ content }: ArticleContentProps) {
  // サニタイズスキーマを拡張（必要な属性を許可）
  const extendedSchema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      '*': [
        ...(defaultSchema.attributes?.['*'] || []),
        'className',
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
    },
  };

  try {
    const file = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRaw)
      .use(rehypeSanitize, extendedSchema)
      .use(rehypeExtractFilenameWrapper)
      .use(rehypePrismPlus, { ignoreMissing: true })
      .use(rehypeAddCodeTitle) // タイトル要素を挿入
      .use(rehypeLineNumbers)
      .use(rehypeStringify)
      .process(content);

    const processedHtml = String(file);

    return (
      <div
        className="prose prose-gray dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    );
  } catch (error) {
    console.error('Error processing article content:', error);
    // フォールバック: 元のHTMLをそのまま表示
    return (
      <div
        className="prose prose-gray dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
}
