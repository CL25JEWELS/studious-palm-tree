# TypeScript Path Alias Configuration

## Overview
This document explains the path alias configuration added to support the `@looppad/core` import in the web application.

## Configuration

### Locations
1. `apps/web/tsconfig.json` - TypeScript configuration
2. `apps/web/vite.config.ts` - Vite bundler configuration
3. `apps/web/index.html` - Vite entry point

### Changes Made

#### TypeScript Configuration
Added `baseUrl` and `paths` configuration to enable TypeScript path mapping:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@looppad/core": ["../../packages/core/src"]
    }
  }
}
```

#### Vite Configuration
Created `vite.config.ts` with matching alias resolution:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@looppad/core': path.resolve(__dirname, '../../packages/core/src'),
    },
  },
});
```

#### HTML Entry Point
Created `index.html` as the Vite entry point:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loop Pad</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

## Why This Change Was Made

### Problem
In a TypeScript monorepo, importing from local packages can be done in multiple ways:
1. Using relative paths: `import { AudioEngine } from '../../packages/core/src'`
2. Using npm package names: `import { AudioEngine } from '@looppad/core'`
3. Using TypeScript path aliases: `import { AudioEngine } from '@looppad/core'`

While the npm package name approach works at runtime (via npm workspaces), TypeScript's type checking and IDE support can benefit from explicit path mapping.

### Solution
The path alias configuration provides:
1. **Better IDE Support**: VSCode and other IDEs can resolve imports more reliably
2. **Consistent Import Syntax**: Developers can use the same `@looppad/core` syntax throughout
3. **Source-Level Resolution**: TypeScript resolves to source files during development, not compiled output
4. **Monorepo Best Practice**: This is a standard pattern in TypeScript monorepos

## Impact

### Backwards Compatibility
- ✅ Existing imports using `@looppad/core` continue to work
- ✅ Relative imports (if any) still function correctly
- ✅ Project references remain in place for build coordination

### Build System
- ✅ TypeScript compilation succeeds with new paths
- ✅ No runtime code changes; this is purely build-time configuration
- ✅ Does not affect production bundle or npm package resolution

### Development Workflow
- ✅ TypeScript type checking works correctly
- ✅ IDE auto-completion and go-to-definition improved
- ✅ No changes needed to import statements in existing code

## Testing

### Verification Steps Performed
1. TypeScript build: `npm run build` ✅
2. Type checking: `npx tsc --noEmit` ✅
3. Import resolution test: Created temporary test file to verify imports ✅
4. Project references: Confirmed they work alongside path aliases ✅
5. Vite configuration: Created vite.config.ts with matching alias ✅
6. HTML entry point: Created index.html for Vite dev server ✅

### Recommended Tests
- [x] Build the web app locally with `npm run build`
- [ ] Start dev server with `npm run dev` (requires index.html and vite.config.ts)
- [ ] Run type checking in IDE (VSCode)
- [ ] Verify go-to-definition works for `@looppad/core` imports
- [ ] Run CI pipeline to ensure no regressions

## Considerations

### Scope
The `baseUrl` is set to `.` (the `apps/web` directory), making the path relative to the web app's root.

### Future Extensibility
As the monorepo grows, additional path aliases can be added:
```json
{
  "paths": {
    "@looppad/core": ["../../packages/core/src"],
    "@looppad/shared": ["../../packages/shared/src"],
    "@looppad/utils": ["../../packages/utils/src"]
  }
}
```

### Alternative Approaches Considered
1. **Root-level baseUrl**: Could set `baseUrl` in the root tsconfig, but this would affect all packages
2. **No path aliases**: Rely solely on npm package resolution, but this provides less IDE support
3. **Different path mapping**: Could map to `dist` instead of `src`, but this requires building core first
4. **Vite-only resolution**: Could skip TypeScript path aliases and use only Vite aliases, but this breaks IDE support

The current approach balances developer experience with monorepo best practices by configuring both TypeScript and Vite.

## References
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Vite Resolve Alias](https://vitejs.dev/config/shared-options.html#resolve-alias)
