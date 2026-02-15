# Contributing to EchoForge

Thank you for your interest in contributing to EchoForge! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Git
- A code editor (VS Code recommended)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/studious-palm-tree.git
   cd studious-palm-tree
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/my-feature
   ```

5. Start development server:
   ```bash
   pnpm dev:web
   ```

## Project Structure

```
echoforge/
├── packages/
│   ├── shared-types/    # TypeScript type definitions
│   ├── core/            # Audio engine and controllers
│   ├── ui/              # Shared UI components
│   ├── web/             # Web application
│   ├── mobile/          # React Native mobile app
│   └── desktop/         # Electron desktop app
├── docs/                # Documentation
└── .github/             # GitHub templates and workflows
```

## Development Workflow

### 1. Making Changes

- Write clean, readable code
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### 2. Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check for linting errors
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

### 3. Testing

Write tests for new features and bug fixes:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific package tests
pnpm --filter @echoforge/core test
```

### 4. Building

Build your changes before committing:

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:web
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(core): add reverb effect to audio engine

Implements a convolution reverb effect using Web Audio API.
Includes impulse response loader and wet/dry mix control.

Closes #123

fix(ui): correct pad button color in muted state

The pad button was showing incorrect color when muted.
Changed color from #424242 to #212121 for better contrast.

docs(readme): update installation instructions

Added pnpm installation steps and clarified Node.js version requirement.
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `pnpm test`
2. Run linter: `pnpm lint`
3. Type check: `pnpm typecheck`
4. Build successfully: `pnpm build`
5. Update documentation if needed
6. Add tests for new features

### Submitting a PR

1. Push your branch to your fork
2. Open a Pull Request against the `main` branch
3. Fill out the PR template completely
4. Link related issues
5. Request review from maintainers

### PR Guidelines

- Keep PRs focused and small
- One feature/fix per PR
- Include tests
- Update documentation
- Add screenshots for UI changes
- Ensure CI passes

## Code Review

All submissions require review. We aim to review PRs within 48 hours.

### Review Checklist

Reviewers will check:
- Code quality and style
- Test coverage
- Documentation
- Performance impact
- Breaking changes
- Accessibility

See [CODE_REVIEW_CHECKLIST.md](.github/CODE_REVIEW_CHECKLIST.md) for details.

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md):

1. Describe the bug clearly
2. Provide steps to reproduce
3. Include environment details
4. Add screenshots if helpful
5. Suggest a fix if possible

## Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md):

1. Describe the feature
2. Explain the use case
3. Consider alternatives
4. Add mockups if available

## Design Contributions

Use the [Design Proposal template](.github/ISSUE_TEMPLATE/design_proposal.md):

1. Describe current state
2. Propose design changes
3. Include mockups/wireframes
4. Consider accessibility
5. Note responsive behavior

## Audio Development Guidelines

### Web Audio API Best Practices

1. **Context Management**
   - Initialize audio context on user interaction
   - Resume suspended contexts
   - Close contexts on cleanup

2. **Node Connections**
   - Connect nodes in correct order
   - Disconnect nodes when done
   - Use gain nodes for volume control

3. **Performance**
   - Minimize node creation
   - Reuse audio buffers
   - Optimize scheduling
   - Target <10ms latency

4. **Error Handling**
   - Handle audio context failures
   - Validate buffer loading
   - Catch scheduling errors

### Audio Testing

Test audio features thoroughly:
- Sample rate compatibility
- Different buffer sizes
- Various input sources
- Edge cases (empty buffers, etc.)
- Browser compatibility

## Documentation

### Code Documentation

- Use JSDoc for public APIs
- Document parameters and return values
- Include usage examples
- Note edge cases and errors

Example:
```typescript
/**
 * Trigger a pad to play
 * @param padId - Unique pad identifier
 * @param velocity - Note velocity (0..1)
 * @throws {PadNotFoundError} if pad doesn't exist
 * @example
 * ```ts
 * audioEngine.triggerPad('pad_1', 0.8);
 * ```
 */
triggerPad(padId: string, velocity?: number): void;
```

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying commands
- Adding dependencies

## Performance Guidelines

### Bundle Size

- Keep bundle size under 500KB (gzipped)
- Use code splitting
- Lazy load components
- Tree-shake dependencies

### Runtime Performance

- Target 60fps UI
- Sub-10ms audio latency
- <100ms TTI (Time to Interactive)
- Optimize re-renders

### Memory Management

- Clean up event listeners
- Dispose audio resources
- Clear timers/intervals
- Avoid memory leaks

## Accessibility Guidelines

### WCAG 2.1 Level AA

- 4.5:1 color contrast ratio
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alt text for images
- ARIA labels and roles

### Testing Accessibility

- Use screen readers (NVDA, VoiceOver)
- Test keyboard navigation
- Check color contrast
- Verify ARIA labels
- Test with accessibility tools

## Release Process

Maintainers handle releases:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. Publish to npm
6. Create GitHub release

## Getting Help

- **Questions**: Open a [Discussion](https://github.com/CL25JEWELS/studious-palm-tree/discussions)
- **Bugs**: Open an [Issue](https://github.com/CL25JEWELS/studious-palm-tree/issues)
- **Chat**: Join our [Discord](https://discord.gg/echoforge)

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to EchoForge! 🎵
