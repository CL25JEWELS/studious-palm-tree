# Development Runbook

This runbook provides comprehensive guidance for developing, building, testing, and deploying the Loop Pad application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Building](#building)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Troubleshooting](#troubleshooting)
- [CI/CD](#cicd)

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v7.0.0 or higher (for workspaces support)
- **Git**: Latest version

### Verify Installation

```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 7.x.x or higher
git --version    # Any recent version
```

### Platform-Specific Prerequisites

#### macOS
```bash
# Install Xcode Command Line Tools (if not already installed)
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
# Install build essentials
sudo apt-get update
sudo apt-get install -y build-essential
```

#### Windows
- Install [Node.js for Windows](https://nodejs.org/)
- Use PowerShell or Git Bash for commands
- Ensure paths with spaces are quoted

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/CL25JEWELS/studious-palm-tree.git
cd studious-palm-tree
```

### 2. Install Dependencies

This command installs dependencies for all workspaces (packages and apps):

```bash
npm install
```

**What this does**:
- Installs root dependencies
- Installs dependencies for `packages/core`
- Installs dependencies for `apps/web`
- Links local packages via npm workspaces

### 3. Build Core Package

The core package must be built first to generate TypeScript declarations:

```bash
npm run build
```

**Or build just the core package**:

```bash
cd packages/core
npm run build
cd ../..
```

## Development Workflow

### Starting Development Server

#### Web Application

```bash
# From root
cd apps/web
npm run dev

# Server starts on http://localhost:3000
# Opens browser automatically
```

**Dev server features**:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- Auto-reload on file changes

### Making Changes

#### Core Package Changes

When modifying the core package:

```bash
# 1. Make changes in packages/core/src/
# 2. Rebuild the core package
cd packages/core
npm run build

# 3. Changes are now available to web app
cd ../../apps/web
npm run dev
```

**Watch mode for core** (continuous rebuild):

```bash
cd packages/core
npm run build -- --watch
```

#### Web Application Changes

Changes to React components hot reload automatically:

```bash
# Just edit files in apps/web/src/
# Vite will automatically reload
```

## Testing

### Running All Tests

From the root directory:

```bash
npm test
```

This runs tests for all workspaces.

### Running Tests by Package

#### Core Package Tests

```bash
cd packages/core
npm test
```

**Test commands**:
```bash
npm test              # Run once
npm run test:watch    # Watch mode (re-run on changes)
npm run test:coverage # With coverage report
```

**Coverage output**:
- Terminal: Shows coverage summary
- HTML: `packages/core/coverage/index.html`

#### Web Application Tests

```bash
cd apps/web
npm test
```

**Test commands**:
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Test Structure

- **Unit Tests**: `src/__tests__/*.test.ts(x)`
- **Component Tests**: `src/__tests__/*.test.tsx`
- **Test Utils**: `src/setupTests.ts`

### Writing Tests

#### Core Package (Unit Tests)

```typescript
// packages/core/src/__tests__/MyModule.test.ts
import { MyModule } from '../index';

describe('MyModule', () => {
  it('should do something', () => {
    const module = new MyModule();
    expect(module.doSomething()).toBe(expected);
  });
});
```

#### Web App (Component Tests)

```typescript
// apps/web/src/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Building

### Build All Packages

From root:

```bash
npm run build
```

### Build Individual Packages

#### Core Package

```bash
cd packages/core
npm run build

# Output: packages/core/dist/
# Contains: JavaScript files and TypeScript declarations
```

#### Web Application

```bash
cd apps/web
npm run build

# Output: apps/web/dist/
# Contains: Production-ready static files
```

### Build Artifacts

- **Core Package**: `packages/core/dist/`
  - `index.js` - Main entry point
  - `index.d.ts` - TypeScript declarations
  - All compiled modules

- **Web Application**: `apps/web/dist/`
  - `index.html` - Entry HTML
  - `assets/` - Bundled JS/CSS with hashes
  - Optimized for production

### Production Build Options

#### Environment Variables

Create `.env.production` in `apps/web/`:

```bash
VITE_API_URL=https://api.example.com
VITE_ENABLE_ANALYTICS=true
```

#### Build Optimization

The production build includes:
- Minification
- Tree shaking
- Code splitting
- Asset optimization
- Source maps (for debugging)

## Platform-Specific Instructions

### macOS

#### Development

```bash
# Standard workflow works out of the box
npm install
npm run build
cd apps/web && npm run dev
```

#### Common Issues

**Xcode Command Line Tools Missing**:
```bash
xcode-select --install
```

### Linux

#### Development

```bash
# Install dependencies
npm install
npm run build
cd apps/web && npm run dev
```

#### Common Issues

**Permission Errors**:
```bash
# Don't use sudo with npm
# Fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Build Tool Errors**:
```bash
sudo apt-get install build-essential
```

### Windows

#### Development

Use PowerShell or Git Bash:

```powershell
# Install dependencies
npm install

# Build packages
npm run build

# Start dev server
cd apps/web
npm run dev
```

#### Common Issues

**Path Issues with Spaces**:
```bash
# Use quotes for paths with spaces
cd "C:\Users\My Name\studious-palm-tree"
```

**Line Ending Issues**:
```bash
# Configure git to handle line endings
git config --global core.autocrlf true
```

**Permission Issues**:
- Run PowerShell/Terminal as Administrator if needed
- Check Windows Defender isn't blocking npm operations

## Troubleshooting

### TypeScript Errors

**Cannot find module '@looppad/core'**:

```bash
# Solution 1: Reinstall dependencies
npm install

# Solution 2: Rebuild core
cd packages/core
npm run build
```

**JSX Issues**:

```bash
# Ensure using package-specific tsconfig
cd apps/web
npx tsc --project tsconfig.json
```

### Test Failures

**Module not found in tests**:

```bash
# Rebuild core package first
cd packages/core
npm run build

# Then run tests
cd ../..
npm test
```

**Jest cache issues**:

```bash
# Clear Jest cache
cd packages/core
npx jest --clearCache

cd ../../apps/web
npx jest --clearCache
```

### Build Failures

**Out of memory**:

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Stale cache**:

```bash
# Clean all build artifacts
rm -rf packages/*/dist
rm -rf apps/*/dist
rm -rf node_modules
npm install
npm run build
```

### Dev Server Issues

**Port already in use**:

```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**HMR not working**:

```bash
# Restart dev server
# Check file watcher limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## CI/CD

### Continuous Integration

The project uses GitHub Actions for CI. See `.github/workflows/ci.yml`.

#### CI Pipeline Steps

1. **Checkout Code**
2. **Setup Node.js**
3. **Install Dependencies**
4. **Lint Code** (if linter configured)
5. **Type Check**
6. **Run Tests**
7. **Build Packages**
8. **Upload Artifacts**

#### Running CI Locally

Simulate CI environment:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run checks
npm run build
npm test

# Verify artifacts
ls -la packages/core/dist
ls -la apps/web/dist
```

### Continuous Deployment

#### Production Deployment

```bash
# Build for production
npm run build

# Deploy web app (example with static hosting)
cd apps/web/dist
# Upload to hosting provider
```

#### Deployment Checklist

- [ ] All tests pass
- [ ] Build succeeds without warnings
- [ ] Environment variables configured
- [ ] Assets optimized
- [ ] Source maps available (if needed)
- [ ] Error tracking configured
- [ ] Analytics configured (if applicable)

## Quick Reference

### Common Commands

```bash
# Setup
npm install              # Install dependencies
npm run build           # Build all packages

# Development
cd apps/web && npm run dev    # Start dev server

# Testing
npm test                      # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # With coverage

# Building
npm run build                 # Build all
cd packages/core && npm run build    # Build core
cd apps/web && npm run build         # Build web
```

### File Structure

```
studious-palm-tree/
├── packages/
│   └── core/              # Core audio engine
│       ├── src/           # Source code
│       ├── dist/          # Built output
│       ├── package.json
│       ├── tsconfig.json
│       └── jest.config.js
├── apps/
│   └── web/              # Web application
│       ├── src/          # Source code
│       ├── dist/         # Built output
│       ├── package.json
│       ├── tsconfig.json
│       └── jest.config.js
├── package.json          # Root package
├── tsconfig.json         # Root TypeScript config
└── .github/
    └── workflows/        # CI/CD workflows
```

## Support

For issues or questions:
1. Check this runbook first
2. Review error messages carefully
3. Check existing GitHub issues
4. Create a new issue with:
   - Steps to reproduce
   - Error messages
   - Environment details (OS, Node version)
