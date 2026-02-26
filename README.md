# abi-dashboard

A small Next.js + TypeScript dashboard for interacting with ABIs and on-chain simulation utilities.

Requirements
- Node 18+ (or Bun). This project includes a `bun.lockb`, so Bun is a first-class option; npm/pnpm/yarn also work.
- Recommended: TypeScript 5+, Next.js 16, React 19 (these are used in package.json).

Quick start (preferred: Bun)

```bash
bun install
bun dev
```

Alternative (npm / pnpm / yarn)

```bash
npm install
npm run dev
# or
pnpm install
pnpm dev
# or
yarn
yarn dev
```

Available scripts (from `package.json`)
- `dev` — run the Next.js dev server (`next dev`)
- `build` — build for production (`next build`)
- `start` — run the production server (`next start`)
- `lint` — run ESLint (consider using `eslint . --ext .ts,.tsx` for full project linting)

Notes & observations
- Next and ESLint: `next` is pinned to `16.1.6` and `eslint-config-next` uses the same version — that keeps Next-specific lint rules aligned.
  Example: `"next": "16.1.6"` and `"eslint-config-next": "16.1.6"` in `package.json`.
- TypeScript config: `tsconfig.json` targets modern JS and uses `moduleResolution: "bundler"` and the Next plugin. This pairs well with TS 5+ and Bun.
  Excerpt: `"moduleResolution": "bundler"` and `"jsx": "react-jsx"`.
- Next config enables the React compiler: `reactCompiler: true` in `next.config.ts`.
- PostCSS/Tailwind: `postcss.config.mjs` uses the `@tailwindcss/postcss` plugin which integrates Tailwind into Next's CSS pipeline.
  Excerpt: `plugins: { "@tailwindcss/postcss": {} }`.
- Dev tooling: there is a `bun.lockb` at the repo root — when using Bun, prefer `bun install` to honor that lockfile.

Suggestions
- Update the `lint` script to lint the project root, e.g.:
  `"lint": "eslint . --ext .ts,.tsx"`
- Consider adding a `format` script if using Prettier, and a `check` script for TypeScript type checks (`tsc -p tsconfig.json --noEmit`).
- Double-check optional packages (for example, `radix-ui`) to ensure package names match published packages.

If you want, I can apply the suggested `lint` script change and add a short `CONTRIBUTING.md` with development conventions.
