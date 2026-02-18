# TypeScript Path Alias Configuration

## Overview
This document explains the path alias configuration added to support the `@looppad/core` import in the web application.

## Configuration

### Location
`apps/web/tsconfig.json`

### Changes Made
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

### Recommended Tests
- [ ] Build the web app locally
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

The current approach balances developer experience with monorepo best practices.

## References
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
