# Contributing to ABI Dashboard

## Development Workflow

This project uses **Next.js 16**, **React 19**, and **Tailwind CSS 4**. **Bun** is the preferred package manager.

### Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the development server:
   ```bash
   bun dev
   ```

### Code Quality & Tooling

We maintain high code quality standards through linting and type checking.

- **Linting:** Run `bun lint` to check for style and common errors.
- **Type Checking:** Run `bun check` (executes `tsc --noEmit`) to verify TypeScript types.
- **Formatting:** Use Prettier for consistent code style. Run `bun format` to format the codebase.

### Conventions

- **State Management:** Use the layered Context providers in `src/store/`.
- **UI Components:** Use the components in `src/components/ui/` (based on Radix UI).
- **Icons:** Use `lucide-react`.
- **Chain Configurations:** Always add or modify chain-specific details in `src/lib/chain.ts`.

### Documentation

Update the relevant markdown files in `docs/context/` when making architectural changes or adding new APIs/tools. Refer to `docs/context/index.md` for a map of the documentation.
