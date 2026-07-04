import { sections, progression } from '../data/questions.js';

export function Overview({ onOpenSection }) {
  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.levels.reduce((s2, l) => s2 + l.questions.length, 0),
    0
  );

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__eyebrow label-md">
          <md-icon style={{ fontSize: '16px' }}>auto_awesome</md-icon>
          Interactive learning path
        </div>
        <h1 className="display-md hero__title">Learn Ansible, one well-answered question at a time.</h1>
        <p className="body-lg hero__subtitle">
          A progressive question set covering directory structure, YAML &amp; ad-hoc syntax, inventories,
          playbooks, and debugging — each answer includes sample files and the exact output you should expect.
        </p>
        <div className="hero__actions">
          <md-filled-button onClick={() => onOpenSection(1)}>
            <md-icon slot="icon">rocket_launch</md-icon>
            Start with Section 1
          </md-filled-button>
          <md-outlined-button onClick={() => onOpenSection(5)}>
            <md-icon slot="icon">bug_report</md-icon>
            Jump to Debugging
          </md-outlined-button>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div className="stat__num">{sections.length}</div>
            <div className="stat__label body-sm">Sections</div>
          </div>
          <div className="stat">
            <div className="stat__num">{totalQuestions}</div>
            <div className="stat__label body-sm">Questions</div>
          </div>
          <div className="stat">
            <div className="stat__num">3</div>
            <div className="stat__label body-sm">Skill levels</div>
          </div>
        </div>
      </section>

      <h2 className="headline-sm" style={{ marginBottom: 16 }}>
        Browse by section
      </h2>
      <div className="section-grid">
        {sections.map((section) => {
          const count = section.levels.reduce((s, l) => s + l.questions.length, 0);
          const iconStyle = {
            '--icon-bg': `var(--accent-${section.id}-container)`,
            '--icon-fg': `var(--accent-${section.id}-on-container)`,
          };
          return (
            <md-elevated-card key={section.id} class="section-card" onClick={() => onOpenSection(section.id)}>
              <div className="section-card-inner">
                <div className="section-card__icon" style={iconStyle}>
                  <md-icon style={{ fontSize: '26px' }}>{section.icon}</md-icon>
                </div>
                <div>
                  <h3 className="title-lg section-card__title">
                    {section.id}. {section.title}
                  </h3>
                  <p className="body-md section-card__blurb">{section.blurb}</p>
                </div>
                <div className="section-card__meta body-sm">
                  <md-icon style={{ fontSize: '16px' }}>quiz</md-icon>
                  {count} questions
                </div>
              </div>
            </md-elevated-card>
          );
        })}
      </div>

      <div className="progression">
        <h2 className="headline-sm">Suggested progression</h2>
        <div className="progression-list">
          {progression.map((p) => (
            <div className="progression-row" key={p.stage}>
              <div className="progression-row__num">{p.stage}</div>
              <span className="body-md">{p.focus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
