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

## Quick Start Guide

### 1. Install Dependencies

Install all dependencies and link local packages:

```bash
npm install
```

### 2. Build Core Package

The core package must be built first to generate type declarations:

```bash
npm run build
```

This will build packages in order:
- First: `@looppad/core` (generates type declarations)
- Then: `@looppad/web` (can import from core)

### 3. Run Development Server

Start the Vite dev server for the web application:

```bash
cd apps/web
npm run dev
```

The application will open automatically at [http://localhost:3000](http://localhost:3000).

## Core Features

### Core Package (@looppad/core)

The core package provides the following interfaces and implementations:

- **AudioEngine**: Audio system initialization and lifecycle management
- **PadController**: Manages 16 pads with individual states, volumes, and sample loading
- **Transport**: Controls playback timing, BPM, and sequencing with beat/bar tracking
- **ProjectManager**: Handles project creation, saving, loading, and management

### UI Components (@looppad/web)

The web application includes the following UI components:

- **PadButton**: Individual pad component for triggering samples with visual feedback
- **Grid**: 4x4 grid layout of 16 colorful pads
- **TransportBar**: Playback controls (play/stop), BPM control, and position display
- **RemixPanel**: Project management interface (new, save, load projects)

## Development Workflow

### Building Individual Packages

```bash
# Build core package
cd packages/core && npm run build

# Build web app
cd apps/web && npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in a specific package
cd packages/core && npm test
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
