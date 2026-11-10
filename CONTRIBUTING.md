<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&height=130&color=0:0B0C10,50:6D63E8,100:8B7CF6&text=Contributing%20to%20MEMORA&fontColor=ECECF4&fontSize=32&fontAlignY=45&animation=fadeIn" width="100%" alt="Contributing to MEMORA" />

</div>

# 🤝 Contributing to MEMORA

Thank you for your interest in contributing to **MEMORA**!

MEMORA is an AI-powered learning platform that turns study materials into reviewers, flashcards, and practice exams, then supports memory with spaced repetition. Whether you are fixing a bug, polishing the interface, improving accessibility, or updating documentation, your help is welcome.

---

# 📌 Table of Contents

1. Getting Started
2. Development Requirements
3. Setting Up the Project
4. Project Principles
5. How the Code Is Organized
6. Types of Contributions
7. Contribution Guidelines
8. Coding Standards
9. UI, Motion, and Accessibility Guidelines
10. Testing Your Changes
11. Reporting Bugs
12. Suggesting Features
13. Submitting Changes
14. Pull Request Checklist
15. Security
16. Code of Conduct
17. License

---

# 1. Getting Started

Before contributing, explore the app and try each area:

- **Overview**: next step, statistics, upcoming reviews, recommendations
- **My Library**: your study sets
- **Smart Reviewer**: the generated reviewer, terms, and checklist
- **Flashcards**: 3D flip cards and recall rating
- **TestForge**: practice examinations
- **MemoryLoop**: spaced-repetition review
- **Mistake Notebook**: collected wrong answers
- **Progress**: analytics and exam history
- **Ask MEMORA**: the study companion
- **Settings**: profile, goal, theme, data

Contributions should support MEMORA's goal: helping students **understand, practice, and remember** more effectively.

---

# 2. Development Requirements

- **Node.js 18+** (20+ recommended) and npm
- **Git**
- A code editor such as Visual Studio Code
- A modern web browser
- A **Google Gemini API key** if you need to test AI generation

Helpful background: TypeScript, React, Vite, Express, and responsive web design.

---

# 3. Setting Up the Project

## Step 1: Fork and clone

Fork the repository to your GitHub account, then:

```bash
git clone https://github.com/YOUR-USERNAME/Memora.git
cd Memora
```

Replace `YOUR-USERNAME` with your GitHub username.

## Step 2: Install dependencies

```bash
npm install
```

## Step 3: Configure environment variables

```bash
cp .env.example .env
```

Add your key to `.env` if you want to test AI features:

```env
GEMINI_API_KEY=your_key_here
```

> The interface runs without a key. Only AI generation and Ask MEMORA need it.

## Step 4: Start the app

```bash
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:8787
- Health check: http://localhost:8787/api/health

## Step 5: Create a branch

```bash
git checkout -b feature/your-feature-name   # new feature
git checkout -b fix/your-bug-name           # bug fix
git checkout -b ui/your-improvement-name    # interface or motion
git checkout -b docs/your-change-name       # documentation
```

Use a clear branch name that describes the purpose of your changes.

---

# 4. Project Principles

These principles keep MEMORA trustworthy. Please follow them.

1. **Never fake data.** Statistics, streaks, and activity must come from the user's real activity. Do not add sample users, placeholder numbers, or mock results.
2. **Never pretend a feature works.** If something is incomplete, keep its honest behavior and improve its interface. Do not add buttons that look interactive but do nothing.
3. **Preserve working functionality.** Do not remove or break scoring, scheduling, document extraction, AI generation, or persistence to simplify a change.
4. **Keep secrets on the server.** The Gemini key is server-only. Never prefix it with `VITE_` and never send it to the browser.
5. **Be honest about AI.** Generated content can be wrong. Keep wording that encourages users to verify important information.
6. **Respect the user's data.** Study material and results are stored in the user's browser. Do not add tracking or external transmission of study content beyond the existing AI request.

---

# 5. How the Code Is Organized

```text
src/
├── App.tsx            # ALL application state and handlers; renders the pages
├── styles.css         # Design tokens (CSS variables) and component styles
├── types.ts           # Shared types
├── components/
│   ├── ui.tsx         # Stat, ProgressBar, Ring, Modal, Toasts, EmptyState...
│   ├── Shell.tsx      # Sidebar, Topbar, BottomNav
│   ├── Modals.tsx     # Create study set, Pro preview, Add card
│   ├── charts.tsx     # Recharts wrappers
│   └── SetCard.tsx
├── pages/             # One presentational file per feature
├── lib/
│   ├── motion.ts      # Shared easing and animation variants
│   ├── srs.ts         # SM-2-inspired scheduler (unit tested)
│   ├── format.ts      # Formatting helpers
│   └── storage.ts     # localStorage persistence
└── services/          # Document extraction and AI requests
server/index.ts        # Express API that proxies Gemini
```

**Rule of thumb:** state and logic belong in `App.tsx` (or `lib/`). Pages in `src/pages/` should mostly *render* what they are given.

---

# 6. Types of Contributions

## 🐛 Bug Fixes
- Broken buttons, navigation, or keyboard shortcuts
- Incorrect scoring, scheduling, or statistics
- Document extraction problems (PDF, DOCX, PPTX, TXT)
- Layout issues on mobile, tablet, or desktop
- Console errors or TypeScript errors

## ✨ Feature Improvements
- Automatic **study streak** tracking
- Reviewing **only due cards** in MemoryLoop
- A daily goal that resets each day
- Timed exam mode
- Import and export of study sets
- Cloud sync using the optional Supabase schema

## 🎨 Interface and Motion
- Typography, spacing, and visual hierarchy
- Loading, empty, and error states
- Purposeful animations and micro-interactions
- Accessibility improvements

## 📚 Documentation
- Clearer setup instructions
- Updated screenshots in `images/`
- Accurate descriptions of limitations

---

# 7. Contribution Guidelines

1. Keep contributions relevant to MEMORA.
2. Keep pull requests focused on one purpose.
3. Reuse existing components before creating new ones.
4. Avoid new dependencies. If one is truly needed, explain why in the pull request.
5. Test your changes before submitting.
6. Update documentation when behavior changes.
7. Do not commit generated files, `node_modules`, `dist`, or `.env`.
8. **Never commit API keys or other secrets.**
9. Do not change the saved-data shape in a way that breaks existing browsers' saved workspaces without a migration.
10. Keep user-facing text clear, friendly, and honest.

---

# 8. Coding Standards

## TypeScript and React
- Keep TypeScript **strict**. Avoid `any` where a real type is practical.
- Put shared types in `src/types.ts`.
- Keep components focused and readable.
- Avoid unnecessary re-renders. Prefer deriving values over duplicating state.
- Use semantic HTML (`button` for actions, `label` for inputs, headings in order).
- Clean up timers and event listeners in effects.

## Server
- Validate request bodies with **Zod**.
- Return clear error messages and correct status codes.
- Never log or return the API key.

## Scheduling logic
- Spaced-repetition math lives in `src/lib/srs.ts`. Keep it free of React and the DOM.
- Any change to scheduling must come with a test in `tests/sm2.test.ts`.

## CSS
- Use the design tokens in `src/styles.css` (`--accent`, `--panel`, `--line`, and so on) rather than hard-coded colors.
- Both dark and light themes must remain usable.
- Avoid inline styles for layout that must respond to screen size.

---

# 9. UI, Motion, and Accessibility Guidelines

MEMORA aims for a refined, minimal, premium feel in the spirit of Linear, Notion, and Raycast.

## Design
- Keep the charcoal and violet/indigo palette. Use gradients sparingly.
- Keep spacing, corner radii, and type sizes consistent.
- Avoid heavy glassmorphism, oversized glows, and decorative clutter.

## Motion
- Import timing and variants from `src/lib/motion.ts` instead of inventing new curves.
- Animate **transform and opacity** where possible, because they are GPU-friendly.
- Every animation should have a purpose. Avoid long, bouncy, or looping effects.
- **Respect reduced motion.** The app wraps framer-motion in `MotionConfig reducedMotion="user"` and `styles.css` has a fallback. New CSS animations must also be covered by the reduced-motion rule.

## Accessibility
- Every interactive element must work with the keyboard and show a visible focus state.
- Give icon-only buttons an `aria-label`.
- Use `role="dialog"` and the shared `Modal` component for dialogs (Escape closes, Tab stays inside).
- Do not rely on color alone to convey state.
- Maintain readable contrast in both themes.
- Provide a text alternative for charts (`role="img"` with an `aria-label`).
- Provide loading, empty, and error states for every data view.

## Responsive design
- Test at phone, tablet, laptop, and desktop widths.
- No horizontal overflow, overlapping elements, or cropped charts.
- On small screens, the bottom navigation must remain usable.

---

# 10. Testing Your Changes

Run these before opening a pull request:

```bash
npm test         # unit tests
npm run build    # type-check and production build
```

Then test manually:

- [ ] Create a study set from pasted text (and from a file if you changed extraction).
- [ ] Flip and rate flashcards, using both mouse and keyboard.
- [ ] Complete a TestForge exam and review the results.
- [ ] Confirm mistakes appear in the Mistake Notebook, and that converting one does not create duplicates.
- [ ] Reload the page and confirm your data persisted.
- [ ] Toggle the light and dark themes.
- [ ] Open the app at a phone width and check navigation.
- [ ] Enable "reduce motion" in your operating system and confirm animations calm down.
- [ ] Check the browser console for errors.

If you change behavior, add or update a test where practical.

---

# 11. Reporting Bugs

Open an issue on GitHub:

**Repository Issues:** https://github.com/rheillunio2-byte/Memora/issues

A useful bug report includes:

**Title:** A short description of the problem.

**Description:** What happened and what you expected.

**Steps to Reproduce:** Numbered steps.

**Environment:** Operating system, browser and version, and Node.js version.

**Screenshots or logs:** Browser console output or error messages, when helpful.

> 🔒 **Security issues:** please do not post vulnerabilities publicly. See [Security](#15-security).

---

# 12. Suggesting Features

Before suggesting a feature:

1. Check whether a similar issue already exists.
2. Explain the problem it solves for learners.
3. Describe how it should work.
4. Explain how it fits the project principles above.

---

# 13. Submitting Changes

```bash
git status
git add <the files that belong to your change>
git commit -m "Fix duplicate flashcards from the mistake notebook"
git push origin fix/duplicate-mistake-cards
```

Example commit messages:

```bash
git commit -m "Add due-only review mode to MemoryLoop"
git commit -m "Improve flashcard flip animation timing"
git commit -m "Fix streak not updating after study"
git commit -m "Improve mobile layout of TestForge"
git commit -m "Update README screenshots"
```

Then open a pull request against the `main` branch of the original repository.

---

# 14. Pull Request Checklist

- [ ] The change addresses the intended issue or feature.
- [ ] `npm test` and `npm run build` pass.
- [ ] Existing functionality still works.
- [ ] No fake data or non-functional controls were added.
- [ ] No secrets, `.env` files, or generated files are included.
- [ ] No new dependencies, or the reason for each is explained.
- [ ] Animations use shared variants and respect reduced motion.
- [ ] Interactive elements are keyboard accessible.
- [ ] Loading, empty, and error states are handled.
- [ ] Layouts work on mobile, tablet, and desktop in both themes.
- [ ] Documentation is updated where needed.
- [ ] Screenshots are attached for visual changes.

## Pull Request Description

**Summary:** What changed?

**Purpose:** Why was it needed?

**Implementation:** How did you do it?

**Testing:** What did you run and check?

**Screenshots:** Before and after, for visual changes.

---

# 15. Security

- Report vulnerabilities **privately** to the maintainer, for example through a private GitHub security advisory or by contacting [@rheillunio2-byte](https://github.com/rheillunio2-byte), rather than in a public issue.
- Never commit `.env` or any API key.
- Never expose server secrets to the client. Only variables prefixed with `VITE_` are exposed by Vite, so never use that prefix for secrets.
- Treat generated AI content as untrusted text. Render it as text, never as raw HTML.

---

# 16. Code of Conduct

- Be respectful and constructive.
- Welcome contributors of every experience level.
- Give feedback that is specific and kind.
- Avoid personal attacks and inappropriate language.
- Focus discussion on improving the project.
- Be open to feedback and revisions.

---

# 17. License

By contributing, you agree that your contributions will be licensed under the project's **MIT License**.

See the [LICENSE](https://github.com/rheillunio2-byte/Memora?tab=MIT-1-ov-file) for details.

---

# 🌌 Thank You for Contributing!

Every bug fix, feature, design refinement, and documentation update helps students learn more effectively.

---

<div align="center">

**MEMORA: Learn smarter. Remember longer.**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:58D6DF,50:6D63E8,100:0B0C10&height=110&section=footer&animation=twinkling" width="100%" alt="footer"/>

</div>
