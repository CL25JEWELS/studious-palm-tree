# CI/CD Guidance for LoopPad

## Overview

This document provides guidance for setting up and maintaining continuous integration and deployment pipelines for the LoopPad project.

## Continuous Integration (CI)

### GitHub Actions Workflow

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push and pull request.

**Pipeline Steps**:

1. **Checkout**: Clone the repository
2. **Setup Node.js**: Install Node.js (tested on 18.x and 20.x)
3. **Install Dependencies**: `npm ci` for clean install
4. **Type Check**: `npm run type-check` - TypeScript compilation check
5. **Lint**: `npm run lint` - ESLint code quality checks
6. **Test**: `npm test` - Run Jest tests
7. **Build**: `npm run build` - Build all packages
8. **Coverage**: Upload test coverage reports

### Running CI Locally

Before pushing, run these commands locally:

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm test

# Build
npm run build
```

### Quality Gates

Pull requests must pass:
- ✅ TypeScript compilation (no type errors)
- ✅ ESLint checks (no linting errors)
- ✅ All tests passing
- ✅ Successful build

## Testing Strategy

### Unit Tests

Located in `packages/core/src/__tests__/`

**Coverage targets**:
- Models: 80%+
- Engine classes: 80%+
- Utilities: 90%+

Run tests:
```bash
cd packages/core
npm test

# With coverage
npm test -- --coverage
```

### Integration Tests

Test Web Audio API integration:
- AudioEngine initialization
- Sample loading
- Voice triggering
- Transport scheduling

### E2E Tests (Future)

Use Playwright or Cypress for:
- UI interaction testing
- Audio playback verification
- Browser compatibility testing

## Build Process

### Development Build

```bash
# Start development server (web app)
cd apps/web
npm run dev
```

Access at `http://localhost:3000`

### Production Build

```bash
# Build all packages
npm run build

# Output:
# - packages/core/dist/
# - apps/web/dist/
```

### Build Optimization

The production build:
- Minifies JavaScript
- Generates source maps
- Tree-shakes unused code
- Optimizes assets

## Deployment

### Static Hosting

The web app can be deployed to:
- **Vercel**: Zero-config deployment
- **Netlify**: Drag-and-drop or Git integration
- **GitHub Pages**: Static site hosting
- **AWS S3 + CloudFront**: Scalable CDN

### Deployment Steps (Vercel)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd apps/web
   vercel --prod
   ```

3. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Environment Variables

For cloud integration:

```env
VITE_API_ENDPOINT=https://api.looppad.io
VITE_CLOUD_STORAGE_URL=https://cdn.looppad.io
```

## Package Publishing

### Publishing to npm

**Prerequisites**:
- npm account
- Scoped package name: `@looppad/core`

**Steps**:

1. Update version:
   ```bash
   cd packages/core
   npm version patch  # or minor, major
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Publish:
   ```bash
   npm publish --access public
   ```

### Automated Publishing

Use semantic-release for automated versioning:

```bash
npm install --save-dev semantic-release
```

Add to `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npx semantic-release
```

## Monitoring

### Error Tracking

Integrate Sentry for error monitoring:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

Track key metrics:
- Audio latency (target: <10ms)
- Sample load time
- Voice allocation time
- UI render performance

### Analytics

Use analytics to track:
- User engagement
- Popular sound packs
- Feature usage
- Browser/device distribution

## Security

### Dependency Scanning

Use Dependabot for automated dependency updates:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Code Scanning

Enable GitHub Code Scanning:
- CodeQL for vulnerability detection
- ESLint security plugin
- npm audit for dependency vulnerabilities

Run security audit:
```bash
npm audit
npm audit fix
```

## Performance Benchmarks

### Target Metrics

- **Latency**: <10ms from trigger to sound
- **Polyphony**: 32+ simultaneous voices
- **Load time**: <2s for initial app load
- **Sample load**: <500ms per sound pack
- **Memory**: <100MB for typical session

### Benchmarking

Run performance tests:

```bash
# Measure audio latency
npm run benchmark:latency

# Measure voice allocation
npm run benchmark:voices

# Measure load times
npm run benchmark:loading
```

## Troubleshooting

### Common CI Failures

**Type errors**:
```bash
npm run type-check
# Fix type errors, then commit
```

**Lint errors**:
```bash
npm run lint -- --fix
# Review and commit fixes
```

**Test failures**:
```bash
npm test -- --verbose
# Debug failing tests
```

**Build failures**:
```bash
npm run build
# Check for compilation errors
```

### Browser Compatibility Issues

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Use BrowserStack or similar for automated cross-browser testing.

## Maintenance

### Weekly Tasks

- Review and merge Dependabot PRs
- Monitor error rates in Sentry
- Check CI/CD pipeline health
- Review test coverage reports

### Monthly Tasks

- Update dependencies
- Review and update documentation
- Analyze performance metrics
- Plan new features based on usage data

### Release Schedule

- **Patch releases**: Bug fixes (as needed)
- **Minor releases**: New features (bi-weekly)
- **Major releases**: Breaking changes (quarterly)
