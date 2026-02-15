# EchoForge Runbook

## Development

### Local Development Setup

```bash
# Install dependencies
pnpm install

# Start web dev server
pnpm dev:web

# Start mobile dev
pnpm dev:mobile

# Start desktop dev
pnpm dev:desktop
```

### Package-Specific Commands

```bash
# Work on core package
cd packages/core
pnpm dev

# Work on UI components
cd packages/ui
pnpm dev

# Work on web app
cd packages/web
pnpm dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific package tests
pnpm --filter @echoforge/core test

# Run with coverage
pnpm test -- --coverage
```

### Linting and Formatting

```bash
# Check linting
pnpm lint

# Fix linting issues
pnpm lint --fix

# Format code
pnpm format

# Type check
pnpm typecheck
```

## Building

### Development Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:web
pnpm build:mobile
pnpm build:desktop
```

### Production Build

```bash
# Clean previous builds
pnpm clean

# Build for production
NODE_ENV=production pnpm build

# Verify bundle size
pnpm --filter @echoforge/web vite build --mode production
```

### Build Optimization

```bash
# Analyze bundle size
pnpm --filter @echoforge/web vite build --mode analyze

# Check TypeScript build info
pnpm build --verbose
```

## Testing

### Unit Tests

```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:unit -- --coverage

# Run specific test file
pnpm test packages/core/src/pad-controller.test.ts
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
npx playwright test --ui

# Run specific E2E test
npx playwright test tests/e2e/pad-grid.spec.ts
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration

# Run with specific browser
pnpm test:integration --project=chromium
```

## Deployment

### Web Application

#### Vercel Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy preview
vercel

# Deploy production
vercel --prod
```

#### Netlify Deployment

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Build
pnpm build:web

# Deploy
netlify deploy --dir=packages/web/dist --prod
```

#### Custom Server

```bash
# Build
pnpm build:web

# Serve with any static server
cd packages/web/dist
npx serve
```

### Mobile Application

#### iOS Build

```bash
# Prerequisites
# - Xcode installed
# - iOS development certificate
# - Provisioning profile

cd packages/mobile

# Install CocoaPods dependencies
cd ios && pod install && cd ..

# Run on simulator
pnpm ios

# Build for device
xcodebuild -workspace ios/EchoForge.xcworkspace \
  -scheme EchoForge \
  -configuration Release \
  -archivePath build/EchoForge.xcarchive \
  archive
```

#### Android Build

```bash
# Prerequisites
# - Android Studio installed
# - Android SDK
# - Keystore file

cd packages/mobile

# Run on emulator
pnpm android

# Build release APK
cd android
./gradlew assembleRelease

# Build release AAB
./gradlew bundleRelease
```

### Desktop Application

#### Windows Build

```bash
cd packages/desktop

# Build
pnpm build

# Package for Windows
pnpm package:win

# Create installer
pnpm make:win
```

#### macOS Build

```bash
cd packages/desktop

# Build
pnpm build

# Package for macOS
pnpm package:mac

# Create DMG
pnpm make:mac

# Sign and notarize
pnpm sign:mac
```

#### Linux Build

```bash
cd packages/desktop

# Build
pnpm build

# Package for Linux
pnpm package:linux

# Create AppImage
pnpm make:linux:appimage

# Create DEB package
pnpm make:linux:deb
```

## CI/CD

### GitHub Actions

The CI workflow runs on push and PR:

```yaml
# Triggered on:
# - Push to main/develop
# - Pull requests to main/develop

# Jobs:
# 1. Lint
# 2. Type Check
# 3. Test
# 4. Build
```

### Manual CI Trigger

```bash
# Trigger workflow manually
gh workflow run ci.yml

# Check workflow status
gh run list

# View workflow logs
gh run view <run-id> --log
```

## Monitoring

### Performance Monitoring

```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Bundle size check
pnpm --filter @echoforge/web vite-bundle-visualizer

# Memory profiling
# Use Chrome DevTools Performance tab
```

### Error Tracking

```bash
# Check application logs
pnpm logs

# View error reports
# Configure error tracking service (Sentry, etc.)
```

## Troubleshooting

### Common Issues

#### Audio Context Not Starting

```bash
# Ensure user interaction before initializing
# Check browser autoplay policy
# Verify Web Audio API support
```

#### Build Failures

```bash
# Clear cache
pnpm store prune

# Remove node_modules
rm -rf node_modules
pnpm install

# Clear Turborepo cache
rm -rf .turbo
pnpm build
```

#### TypeScript Errors

```bash
# Rebuild type definitions
pnpm build:types

# Clear TypeScript cache
rm -rf packages/*/tsconfig.tsbuildinfo

# Restart TypeScript server (VS Code)
# Cmd+Shift+P -> TypeScript: Restart TS Server
```

#### Test Failures

```bash
# Run tests with verbose output
pnpm test -- --verbose

# Run tests without cache
pnpm test -- --no-cache

# Debug specific test
node --inspect-brk node_modules/.bin/vitest run <test-file>
```

## Maintenance

### Dependency Updates

```bash
# Check outdated dependencies
pnpm outdated

# Update dependencies
pnpm update

# Update specific package
pnpm update <package-name>

# Update to latest
pnpm update --latest
```

### Security Audits

```bash
# Run security audit
pnpm audit

# Fix security issues
pnpm audit --fix

# Check for vulnerabilities
npx snyk test
```

### Database Maintenance

```bash
# Clear local storage
# Open browser console:
localStorage.clear();

# Export projects before clearing
# Use ProjectManager.exportProject()
```

## Backup and Recovery

### Backup Project Data

```bash
# Export from browser
# Settings -> Export All Projects

# Backup IndexedDB
# Use browser dev tools -> Application -> IndexedDB
```

### Restore Project Data

```bash
# Import to browser
# Settings -> Import Project

# Restore from backup
# Drag and drop .json file into app
```

## Support

### Logs Location

- **Web**: Browser console
- **Mobile**: Device logs (Xcode/Android Studio)
- **Desktop**: Application logs folder

### Getting Help

- GitHub Issues: https://github.com/CL25JEWELS/studious-palm-tree/issues
- Discord: https://discord.gg/echoforge
- Email: support@echoforge.app

### Reporting Issues

Include:
1. Platform and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Error messages/logs
5. Environment details
