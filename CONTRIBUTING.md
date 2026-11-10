# Contributing to MEMORA

Thank you for considering a contribution. MEMORA aims to make studying more understandable, measurable, and effective.

## Development setup

1. Install Node.js 20+.
2. Fork and clone the repository.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add a Gemini API key if you want to test AI features.
6. Run `npm run dev`.

## Contribution guidelines

- Keep the experience student-friendly and accessible.
- Prefer focused changes over broad rewrites.
- Preserve working functionality when improving the UI.
- Do not introduce fabricated learning metrics or unsupported source facts.
- Keep API secrets on the server.
- Validate user input and handle errors visibly.
- Respect `prefers-reduced-motion`.
- Add tests for changes to scoring, scheduling, parsing, and generation validation.

## Code style

- Use TypeScript and explicit types for application data.
- Use functional React components and hooks.
- Keep reusable business logic in `src/lib` or `src/services`.
- Use Lucide icons consistently.
- Keep styling in the shared design system in `src/styles.css`.

## Pull requests

Include:
- A concise summary of the change.
- Screenshots for visual changes.
- Steps to reproduce and verify.
- Relevant test results.
- Any new environment variables or setup steps.

## Security

Never commit API keys, access tokens, private documents, or user data. Report vulnerabilities privately to the repository owner rather than publishing exploit details in an issue.
