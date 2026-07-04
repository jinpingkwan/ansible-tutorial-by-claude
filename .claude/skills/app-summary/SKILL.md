---
name: app-summary
description: >
  Use this skill whenever asked to summarize, describe, or explain the
  ansible-tutorial-app project — an elevator pitch, a project overview, a
  README, release/PR notes, or context to hand to another person or AI.
  Contains verified facts about the app's purpose, content, features, and
  tech stack so summaries stay accurate instead of re-deriving or guessing
  numbers. Trigger on: "summarize the app", "what does this app do",
  "describe this project", "write a README", "give me an overview",
  "explain this app to X", "project summary", "elevator pitch".
---

# Ansible Tutorial App — Summary Reference

Verified facts about the app, plus guidance on how much of it to use
depending on what the summary is for. Re-verify the numbers below with the
commands in "Keeping this accurate" if the content set may have changed
since — don't assume they're still current after major edits to
`src/data/questions.js`.

## What it is (one sentence)

An interactive React web app that turns a 5-section, 49-question Ansible
tutorial into a searchable, beginner-to-advanced study tool, styled as a
Material 3 Expressive Google-style site using real `@material/web`
components.

## The pitch (one paragraph)

Ansible Tutorial · Interactive Q&A takes a static Markdown question bank
and turns it into a browsable learning app: every question ships with a
full explanation, a terminal-styled "expected output" panel, copyable
sample files, and suggested filenames, so a learner can read a question and
immediately see what running it actually produces. Content progresses
beginner → intermediate → advanced across 5 topics (setup, syntax,
inventories, playbooks, debugging), with a level filter, full-text search
across all questions, and light/dark theming — all built on Google's own
Material 3 Expressive design language rather than a generic component kit.

## Verified facts

- **Content:** 49 questions across 5 sections (numbers confirmed against
  `src/data/questions.js`):
  | # | Section | Questions | Beginner / Intermediate / Advanced |
  |---|---|---|---|
  | 1 | Ansible Directory Structure & Setup | 8 | 3 / 3 / 2 |
  | 2 | Ansible Syntax Basics | 8 | 3 / 3 / 2 |
  | 3 | Writing Ansible Inventories | 9 | 3 / 3 / 3 |
  | 4 | Writing Ansible Playbooks | 12 | 3 / 4 / 5 |
  | 5 | Debugging Playbook Syntax Errors | 12 | 3 / 4 / 5 |
  Each question includes: an explanation, sample file(s) with filenames,
  and a terminal-styled expected-output block (see
  `[[m3-theme-styling]]` for the CodeBlock vs. TerminalBlock distinction).
- **Stack:** React 18 + Vite 6, `@material/web` 2.x (Google's official
  Material 3 web-component library, including `labs/` components for
  card/segmented-button), plain CSS design tokens for theming (no Tailwind
  or third-party UI kit), no router library — navigation is hand-rolled
  hash-based routing (`#/`, `#/section/<id>`, `#/search/<query>`) in
  `App.jsx` so routes are shareable/bookmarkable.
- **Features:** overview landing page (hero + section grid + suggested
  progression table); per-section pages with a Beginner/Intermediate/
  Advanced segmented-button filter; global search across all
  questions/answers/sample data; light/dark theme toggle (persisted);
  collapsible desktop sidebar (icon rail) + mobile overlay drawer
  (persisted/responsive); back-to-top FAB; one-click copy on every code and
  terminal block.
- **No backend.** Fully static/client-side — all content lives in
  `src/data/questions.js`, bundled at build time. `npm run build` (or
  `node node_modules/vite/bin/vite.js build` — see gotcha below) produces a
  static `dist/` deployable anywhere.
- **Origin:** built from a single Markdown question set
  (`ansible-tutorial-questions.md`, one directory up from the app) that
  spans directory structure/config, YAML & ad-hoc syntax, inventories,
  playbooks, and debugging — the app's structure mirrors that document's
  sections and levels exactly.

## Matching detail to the ask

| Ask | Give them |
|---|---|
| "what is this" / elevator pitch | The one-sentence line above |
| PR description, Slack message | The one-paragraph pitch above |
| README | Pitch + features list + stack + "Getting started" (below) |
| Technical handoff / onboarding | Stack + features + point them at `[[m3-theme-styling]]` for design-system detail, and `src/data/questions.js` for the content schema |
| "how big is this" / stats only | Just the content table |

Don't pad a one-sentence ask with the full feature list, and don't hand a
README request just the elevator pitch — match the table above.

## Getting started (for README-style summaries)

```
cd ansible-tutorial-app
npm install
npm run dev       # dev server, default http://localhost:5173
npm run build     # production build to dist/
```

Note: in sandboxed/CI environments where `npm run dev`/`npx` fail to
resolve because `node_modules/.bin` didn't get symlinked, fall back to
`node node_modules/vite/bin/vite.js` (dev or build) — this has been hit
before in this project. Don't present this as a normal step in a
user-facing README; it's an environment workaround, not how the app
normally runs.

## Keeping this accurate

If `src/data/questions.js` has changed since this was written, recompute
the content table instead of reusing it verbatim:

```bash
cd ansible-tutorial-app
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/data/questions.js','utf8').replace(/export const /g, 'exports.');
fs.writeFileSync('/tmp/q.cjs', src);
const { sections } = require('/tmp/q.cjs');
let total = 0;
for (const s of sections) {
  const c = s.levels.reduce((a,l)=>a+l.questions.length,0);
  total += c;
  console.log(s.id, '-', s.title, '-', c, 'questions (', s.levels.map(l=>l.level+':'+l.questions.length).join(', '), ')');
}
console.log('TOTAL', total, 'questions across', sections.length, 'sections');
"
```
