import { useMemo, useState } from 'react';
import { QuestionCard } from './QuestionCard.jsx';

const LEVEL_DOT = {
  Beginner: 'var(--accent-2)',
  Intermediate: 'var(--accent-4)',
  Advanced: 'var(--accent-5)',
};

export function SectionView({ section, onBack }) {
  const [filter, setFilter] = useState('All');

  const levels = useMemo(() => {
    if (filter === 'All') return section.levels;
    return section.levels.filter((l) => l.level === filter);
  }, [section, filter]);

  const totalQuestions = section.levels.reduce((sum, l) => sum + l.questions.length, 0);

  const iconStyle = {
    '--icon-bg': `var(--accent-${section.id}-container)`,
    '--icon-fg': `var(--accent-${section.id}-on-container)`,
  };

  return (
    <div className="page">
      <div className="breadcrumb" onClick={onBack}>
        <md-icon style={{ fontSize: '18px' }}>arrow_back</md-icon>
        All sections
      </div>

      <div className="section-header">
        <div className="section-header__icon" style={iconStyle}>
          <md-icon style={{ fontSize: '30px' }}>{section.icon}</md-icon>
        </div>
        <div>
          <h1 className="headline-lg">
            {section.id}. {section.title}
          </h1>
          <p className="section-header__blurb body-lg">{section.blurb}</p>
        </div>
      </div>

      <div className="filter-row level-filter">
        <md-outlined-segmented-button-set>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <md-outlined-segmented-button
              key={lvl}
              label={lvl}
              selected={filter === lvl ? true : undefined}
              onClick={() => setFilter(lvl)}
            ></md-outlined-segmented-button>
          ))}
        </md-outlined-segmented-button-set>
        <span className="body-sm on-surface-variant">
          {totalQuestions} question{totalQuestions === 1 ? '' : 's'} in this section
        </span>
      </div>

      {levels.map((levelGroup) => (
        <div key={levelGroup.level}>
          <div className="level-group-title">
            <span className="level-dot" style={{ '--dot-color': LEVEL_DOT[levelGroup.level] }} />
            <span className="title-md">{levelGroup.level}</span>
          </div>
          {levelGroup.questions.map((q) => (
            <QuestionCard key={q.id} question={q} sectionId={section.id} />
          ))}
        </div>
      ))}
    </div>
  );
}
