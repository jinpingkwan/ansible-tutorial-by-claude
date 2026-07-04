import { useEffect, useRef, useState } from 'react';
import { sections } from './data/questions.js';
import { Overview } from './components/Overview.jsx';
import { SectionView } from './components/SectionView.jsx';
import { SearchResults } from './components/SearchResults.jsx';

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('section/')) {
    const id = Number(hash.split('/')[1]);
    return { view: 'section', sectionId: id };
  }
  if (hash.startsWith('search/')) {
    const q = decodeURIComponent(hash.split('/').slice(1).join('/'));
    return { view: 'search', query: q };
  }
  return { view: 'overview' };
}

export default function App() {
  const [route, setRoute] = useState(parseHash());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('ansible-tutorial-drawer-collapsed') === 'true'
  );
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('ansible-tutorial-theme') === 'dark'
  );
  const [showFab, setShowFab] = useState(false);

  const searchRef = useRef(null);
  const switchRef = useRef(null);
  const mainRef = useRef(null);

  // Keep route state in sync with the URL hash (supports back/forward + shareable links).
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('ansible-tutorial-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('ansible-tutorial-drawer-collapsed', String(collapsed));
  }, [collapsed]);

  // Material Web custom elements dispatch real DOM events; wire them up via refs
  // rather than relying on React's synthetic prop names for full reliability.
  useEffect(() => {
    const el = searchRef.current;
    if (!el) return undefined;
    const handler = (e) => {
      const value = e.target.value ?? '';
      if (value.trim()) {
        window.location.hash = `#/search/${encodeURIComponent(value)}`;
      } else if (route.view === 'search') {
        window.location.hash = '#/';
      }
    };
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [route.view]);

  useEffect(() => {
    const el = switchRef.current;
    if (!el) return undefined;
    const handler = (e) => setIsDark(!!e.target.selected);
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return undefined;
    const onScroll = () => setShowFab(el.scrollTop > 480);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [route]);

  useEffect(() => {
    if (switchRef.current) switchRef.current.selected = isDark;
  }, [isDark, route]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    setDrawerOpen(false);
  }, [route]);

  const goOverview = () => {
    window.location.hash = '#/';
  };
  const goSection = (id) => {
    window.location.hash = `#/section/${id}`;
  };
  const scrollTop = () => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className={`app-shell ${collapsed ? 'app-shell--collapsed' : ''}`}>
      <header className="topbar">
        <md-icon-button class="menu-toggle" onClick={() => setDrawerOpen((v) => !v)} aria-label="Toggle menu">
          <md-icon>menu</md-icon>
        </md-icon-button>

        <div className="topbar__brand" onClick={goOverview}>
          <div className="topbar__logo">
            <md-icon>terminal</md-icon>
          </div>
          <div className="topbar__title">
            Ansible Tutorial <span>· Interactive Q&amp;A</span>
          </div>
        </div>

        <div className="topbar__search">
          <md-outlined-text-field
            ref={searchRef}
            label="Search all questions"
            defaultValue={route.view === 'search' ? route.query : ''}
          >
            <md-icon slot="leading-icon">search</md-icon>
          </md-outlined-text-field>
        </div>

        <div className="topbar__actions">
          <md-icon aria-hidden="true">light_mode</md-icon>
          <md-switch ref={switchRef} aria-label="Toggle dark mode"></md-switch>
          <md-icon aria-hidden="true">dark_mode</md-icon>
        </div>
      </header>

      <md-icon-button
        class="drawer-collapse-handle"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <md-icon>{collapsed ? 'chevron_right' : 'chevron_left'}</md-icon>
      </md-icon-button>

      <nav className={`drawer ${drawerOpen ? 'drawer--open' : ''} ${collapsed ? 'drawer--collapsed' : ''}`}>
        <div className="drawer__section-label label-md on-surface-variant">Learn</div>
        <button
          className={`nav-item ${route.view === 'overview' ? 'active' : ''}`}
          onClick={goOverview}
          title="Overview"
        >
          <span className="nav-item__icon">
            <md-icon style={{ fontSize: '18px' }}>home</md-icon>
          </span>
          <span className="nav-item__label">Overview</span>
        </button>

        <div className="drawer__section-label label-md on-surface-variant">Sections</div>
        {sections.map((section) => {
          const count = section.levels.reduce((s, l) => s + l.questions.length, 0);
          const active = route.view === 'section' && route.sectionId === section.id;
          const iconStyle = {
            '--nav-icon-bg': `var(--accent-${section.id}-container)`,
            '--nav-icon-fg': `var(--accent-${section.id}-on-container)`,
          };
          return (
            <button
              key={section.id}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => goSection(section.id)}
              title={section.title}
            >
              <span className="nav-item__icon" style={iconStyle}>
                <md-icon style={{ fontSize: '18px' }}>{section.icon}</md-icon>
              </span>
              <span className="nav-item__label">{section.title}</span>
              <span className="nav-item__count">{count}</span>
            </button>
          );
        })}

        <div className="drawer__footer">
          <p className="body-sm on-surface-variant">
            Every answer includes sample files and the exact output you should expect — work through each
            section beginner → advanced.
          </p>
        </div>
      </nav>

      <main className="main" ref={mainRef}>
        {route.view === 'section' &&
          (() => {
            const section = sections.find((s) => s.id === route.sectionId);
            if (!section) return <Overview onOpenSection={goSection} />;
            return <SectionView section={section} onBack={goOverview} />;
          })()}
        {route.view === 'search' && <SearchResults query={route.query} onBack={goOverview} />}
        {route.view === 'overview' && <Overview onOpenSection={goSection} />}
      </main>

      {showFab && (
        <md-fab class="fab-top" size="medium" aria-label="Back to top" onClick={scrollTop}>
          <md-icon slot="icon">arrow_upward</md-icon>
        </md-fab>
      )}
    </div>
  );
}
