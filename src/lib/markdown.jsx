// Tiny markdown-lite parser for our controlled content set.
// Supports: fenced ```lang blocks, `inline code`, **bold**, "- " bullets, "1. " ordered lists, paragraphs.

function parseInline(text, keyPrefix) {
  const nodes = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`${keyPrefix}-t${i++}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b${i++}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(
        <code className="inline-code" key={`${keyPrefix}-c${i++}`}>
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<span key={`${keyPrefix}-t${i++}`}>{text.slice(lastIndex)}</span>);
  }
  return nodes;
}

export function parseMarkdownLite(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  let buffer = [];

  const flush = () => {
    if (buffer.length) {
      blocks.push({ type: 'p', text: buffer.join(' ').trim() });
      buffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flush();
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      flush();
      const items = [];
      while (i < lines.length && /^-\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^-\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flush();
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (trimmed === '') {
      flush();
      i++;
      continue;
    }

    buffer.push(trimmed);
    i++;
  }
  flush();
  return blocks;
}

export function RichText({ text, className }) {
  const blocks = parseMarkdownLite(text || '');
  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        const key = `blk-${idx}`;
        if (block.type === 'p') {
          return (
            <p className="body-lg" key={key}>
              {parseInline(block.text, key)}
            </p>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul className="body-lg" key={key}>
              {block.items.map((item, j) => (
                <li key={`${key}-${j}`}>{parseInline(item, `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol className="body-lg" key={key}>
              {block.items.map((item, j) => (
                <li key={`${key}-${j}`}>{parseInline(item, `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === 'code') {
          return <InlineFencedCode key={key} lang={block.lang} content={block.content} />;
        }
        return null;
      })}
    </div>
  );
}

// A minimal fenced-code renderer used for code blocks embedded directly
// inside question/answer prose (as opposed to the dedicated CodeBlock
// component used for the "Sample data" / "Expected output" panels).
function InlineFencedCode({ lang, content }) {
  return (
    <div className="code-block">
      {lang ? (
        <div className="code-block__header">
          <span className="code-block__filename">{lang}</span>
        </div>
      ) : null}
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  );
}
