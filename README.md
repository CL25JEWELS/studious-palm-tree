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

## Development

### Running the Web Application

```bash
cd apps/web
npm run dev
```

The development server will start on http://localhost:3000 with hot module replacement.

## Testing

### Running All Tests

From the root directory:

```bash
npm test
```

### Running Tests for Specific Packages

```bash
# Core package tests
cd packages/core
npm test

# Web app tests
cd apps/web
npm test
```

### Test Coverage

```bash
# Core package coverage
cd packages/core
npm run test:coverage

# Web app coverage
cd apps/web
npm run test:coverage
```

### Watch Mode

Run tests continuously as you develop:

```bash
cd packages/core
npm run test:watch
```

## Documentation

- **[RUNBOOK.md](./RUNBOOK.md)** - Comprehensive development guide with platform-specific instructions
- **[E2E_TESTING.md](./E2E_TESTING.md)** - End-to-end testing strategy and examples
- **[CI Workflow](./.github/workflows/ci.yml)** - Automated testing and build pipeline

## Architecture

### Core Package (`@looppad/core`)

The core audio engine provides:
- **AudioEngine**: Audio context lifecycle management
- **PadController**: 16-pad state management (4x4 grid)
- **Transport**: BPM, timing, and playback control
- **ProjectManager**: Project persistence via localStorage

### Web Application (`@looppad/web`)

React-based UI with components:
- **PadButton**: Individual pad with state visualization
- **TransportBar**: Play/stop/BPM controls
- **App**: Main application container

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

## Continuous Integration

This project uses GitHub Actions for CI/CD. The pipeline includes:

1. **Lint and Type Check**: Validates TypeScript code
2. **Test**: Runs unit and component tests with coverage
3. **Build**: Creates production builds and verifies artifacts
4. **Matrix Testing**: Tests on Node.js 18 and 20

See [.github/workflows/ci.yml](./.github/workflows/ci.yml) for details.

## Quick Commands Reference

```bash
# Setup
npm install              # Install all dependencies
npm run build           # Build all packages

# Development
cd apps/web && npm run dev    # Start dev server

# Testing
npm test                      # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # With coverage

# Type Checking
cd packages/core && npx tsc --noEmit    # Check core types
cd apps/web && npx tsc --noEmit         # Check web types
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Build packages: `npm run build`
5. Submit a pull request

The CI pipeline will automatically run on your PR.

## License

MIT
