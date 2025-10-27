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
                // ファイル名をdata-file属性として追加（イミュータブルな更新）
                codeNode.properties = {
                  ...(codeNode.properties ?? {}),
                  dataFile: filename,
                };
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
    const nodesToProcess: Array<{
      parent: Parents;
      index: number;
      titleElement: Element;
    }> = [];

    // まず全てのpreタグを収集
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

        // タイトルがある場合、後で挿入するために記録
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

    // 逆順で挿入（インデックスのずれを防ぐ）
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
  const ALLOWED_PRISM_ATTRS = ['data-line', 'dataLine', 'data-highlight', 'dataHighlight'];

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

      // 既に取得済みの code 要素を再利用
      const codeElement = code;

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
    // フォールバック: 元のHTMLをそのまま表示（エラーメッセージ付き）
    return (
      <div>
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800">
          コンテンツの処理中にエラーが発生しました。元のHTMLを表示しています。
        </div>
        <div
          className="prose prose-gray dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }
}
