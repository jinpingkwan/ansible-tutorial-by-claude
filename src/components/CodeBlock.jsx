import { useState } from 'react';

export function CodeBlock({ filename, content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — ignore silently
    }
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__filename">
          <md-icon style={{ fontSize: '16px', width: '16px', height: '16px' }}>description</md-icon>
          {filename}
        </span>
        <md-icon-button class="copy-btn" onClick={handleCopy} aria-label="Copy to clipboard" title={copied ? 'Copied!' : 'Copy'}>
          <md-icon>{copied ? 'check' : 'content_copy'}</md-icon>
        </md-icon-button>
      </div>
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  );
}

export function TerminalBlock({ label = 'Expected output', content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — ignore silently
    }
  };

  return (
    <div className="terminal-block">
      <div className="terminal-block__header">
        <span className="terminal-dot" style={{ background: '#ff5f57' }} />
        <span className="terminal-dot" style={{ background: '#febc2e' }} />
        <span className="terminal-dot" style={{ background: '#28c840' }} />
        <span className="terminal-block__label">
          <md-icon style={{ fontSize: '14px', width: '14px', height: '14px' }}>terminal</md-icon>
          {label}
        </span>
        <md-icon-button
          class="copy-btn"
          style={{ marginLeft: 'auto', '--md-icon-button-icon-color': '#e3e3e3', '--md-sys-color-on-surface-variant': '#e3e3e3' }}
          onClick={handleCopy}
          aria-label="Copy output"
          title={copied ? 'Copied!' : 'Copy'}
        >
          <md-icon>{copied ? 'check' : 'content_copy'}</md-icon>
        </md-icon-button>
      </div>
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  );
}
