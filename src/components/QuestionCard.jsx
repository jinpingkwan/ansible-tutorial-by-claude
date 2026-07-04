import { RichText } from '../lib/markdown.jsx';
import { CodeBlock, TerminalBlock } from './CodeBlock.jsx';

export function QuestionCard({ question, sectionId }) {
  const style = {
    '--badge-bg': `var(--accent-${sectionId}-container)`,
    '--badge-fg': `var(--accent-${sectionId}-on-container)`,
  };

  return (
    <md-elevated-card class="question-card" id={`q-${question.id}`} style={style}>
      <div className="question-card-inner">
        <div className="question-card__header">
          <span className="question-id-badge">{question.id}</span>
          <h3 className="question-card__title title-lg">
            <RichTextInline text={question.q} />
          </h3>
        </div>

        {question.q.includes('```') && <RichTextFenceOnly text={question.q} />}

        {question.files?.length ? (
          <div className="file-chip-row">
            {question.files.map((f) => (
              <md-assist-chip key={f} label={f}>
                <md-icon slot="icon" style={{ fontSize: '16px' }}>
                  draft
                </md-icon>
              </md-assist-chip>
            ))}
          </div>
        ) : null}

        <RichText className="answer-block" text={question.a} />

        {question.sample?.length ? (
          <>
            <div className="subsection-title label-md">
              <md-icon style={{ fontSize: '18px' }}>folder_data</md-icon>
              Sample data
            </div>
            {question.sample.map((s, idx) => (
              <CodeBlock key={idx} filename={s.file} content={s.content} />
            ))}
          </>
        ) : null}

        {question.out ? (
          <>
            <div className="subsection-title label-md">
              <md-icon style={{ fontSize: '18px' }}>play_arrow</md-icon>
              Expected output
            </div>
            <TerminalBlock content={question.out} />
          </>
        ) : null}
      </div>
    </md-elevated-card>
  );
}

// The question text itself is short prose that may embed one fenced code
// block (the "Debug this ..." style questions). Render the prose portion
// inline as a title, and let RichTextFenceOnly render any fenced block below.
function RichTextInline({ text }) {
  const withoutFence = text.split('```')[0].trim();
  return <>{withoutFence}</>;
}

function RichTextFenceOnly({ text }) {
  const fenceStart = text.indexOf('```');
  if (fenceStart === -1) return null;
  const fenced = text.slice(fenceStart);
  return <RichText text={fenced} />;
}
