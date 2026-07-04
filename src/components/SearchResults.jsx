import { useMemo } from 'react';
import { sections } from '../data/questions.js';
import { QuestionCard } from './QuestionCard.jsx';

function matches(question, needle) {
  const haystack = [
    question.id,
    question.q,
    question.a,
    ...(question.files || []),
    ...(question.sample || []).map((s) => `${s.file} ${s.content}`),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export function SearchResults({ query, onBack }) {
  const needle = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!needle) return [];
    const out = [];
    for (const section of sections) {
      const hits = [];
      for (const levelGroup of section.levels) {
        for (const q of levelGroup.questions) {
          if (matches(q, needle)) hits.push(q);
        }
      }
      if (hits.length) out.push({ section, hits });
    }
    return out;
  }, [needle]);

  const totalHits = results.reduce((sum, r) => sum + r.hits.length, 0);

  return (
    <div className="page">
      <div className="breadcrumb" onClick={onBack}>
        <md-icon style={{ fontSize: '18px' }}>arrow_back</md-icon>
        Back
      </div>

      <h1 className="headline-md" style={{ marginBottom: 6 }}>
        Search results for &ldquo;{query}&rdquo;
      </h1>
      <p className="body-md on-surface-variant" style={{ marginBottom: 8 }}>
        {totalHits} question{totalHits === 1 ? '' : 's'} found
      </p>

      {totalHits === 0 ? (
        <div className="empty-state">
          <md-icon>search_off</md-icon>
          <p className="title-md">No matches</p>
          <p className="body-md">Try a different keyword — e.g. &ldquo;handler&rdquo;, &ldquo;inventory&rdquo;, or &ldquo;idempotent&rdquo;.</p>
        </div>
      ) : (
        results.map(({ section, hits }) => {
          const iconStyle = {
            '--icon-bg': `var(--accent-${section.id}-container)`,
            '--icon-fg': `var(--accent-${section.id}-on-container)`,
          };
          return (
            <div key={section.id}>
              <div className="search-hit-section">
                <div className="nav-item__icon" style={iconStyle}>
                  <md-icon style={{ fontSize: '18px' }}>{section.icon}</md-icon>
                </div>
                <span className="title-md">
                  {section.id}. {section.title}
                </span>
              </div>
              {hits.map((q) => (
                <QuestionCard key={q.id} question={q} sectionId={section.id} />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
