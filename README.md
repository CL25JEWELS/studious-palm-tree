# studious-palm-tree

Loop pad social network - A TypeScript monorepo for a loop-based audio application

## Project Structure

This is a monorepo managed with npm workspaces:

```
├── packages/
│   └── core/          # @looppad/core - Core audio engine
└── apps/
    └── web/           # @looppad/web - Web application
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v7 or higher for workspaces support)

## Getting Started

1. **Install dependencies** (links local packages via npm workspaces):
   ```bash
   npm install
   ```

2. **Build all packages**:
   ```bash
   npm run build
   ```

   This will build packages in order:
   - First: `@looppad/core` (generates type declarations)
   - Then: `@looppad/web` (can import from core)

3. **Build individual packages**:
   ```bash
   # Build core package
   cd packages/core && npm run build

   # Build web app
   cd apps/web && npm run build
   ```

## TypeScript Configuration

The project uses a hierarchical TypeScript configuration:

- **Root `tsconfig.json`**: Shared compiler options including `"jsx": "react-jsx"`
- **Package configs**: Extend root config with package-specific settings

All packages inherit JSX support from the root configuration, ensuring consistent compilation across the monorepo.

## Resolving TypeScript Errors

If you encounter TypeScript errors:

1. **"Cannot use JSX unless the '--jsx' flag is provided"**
   - Ensure you're using the package-specific tsconfig: `tsc --project apps/web/tsconfig.json`
   - The root tsconfig.json includes `"jsx": "react-jsx"` which is inherited

2. **"Cannot find module '@looppad/core'"**
   - Run `npm install` at the root to link local packages
   - Ensure `packages/core` is built: `cd packages/core && npm run build`
   - Check that `node_modules/@looppad/core` symlink exists
