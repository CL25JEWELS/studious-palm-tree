# Code Review Checklist

## General
- [ ] Code follows project style guidelines
- [ ] Code is self-documenting with clear variable/function names
- [ ] Complex logic has explanatory comments
- [ ] No commented-out code (use git history instead)
- [ ] No debug console.log statements
- [ ] Error handling is appropriate
- [ ] Edge cases are handled

## TypeScript
- [ ] Types are properly defined (no `any` unless necessary)
- [ ] Type assertions are justified
- [ ] Interfaces/types are exported if used elsewhere
- [ ] Enums are used appropriately
- [ ] Generic types are used where beneficial

## React Components
- [ ] Components are properly typed with Props interfaces
- [ ] Components follow single responsibility principle
- [ ] Hooks are used correctly (dependencies, cleanup)
- [ ] No unnecessary re-renders
- [ ] Accessibility attributes (ARIA) are present
- [ ] Component is responsive
- [ ] Loading and error states are handled

## Audio Engine
- [ ] Audio context is properly managed
- [ ] Audio nodes are connected correctly
- [ ] Resources are cleaned up (dispose/disconnect)
- [ ] Latency requirements are met
- [ ] Sample rate handling is correct
- [ ] Buffer size is appropriate

## Performance
- [ ] No performance bottlenecks
- [ ] Expensive operations are optimized
- [ ] Memoization used where appropriate
- [ ] Bundle size impact is acceptable
- [ ] Memory leaks are prevented

## Testing
- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Error paths are tested
- [ ] Tests are readable and maintainable
- [ ] Test coverage is adequate (>80% for core)

## Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] JSDoc comments for public APIs
- [ ] Migration guide for breaking changes
- [ ] CHANGELOG updated

## Security
- [ ] No sensitive data in code
- [ ] Input validation is present
- [ ] XSS vulnerabilities addressed
- [ ] Dependencies are up to date
- [ ] Audio file sources are validated

## Accessibility
- [ ] WCAG 2.1 Level AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast is sufficient (4.5:1)
- [ ] Focus indicators are visible

## Git
- [ ] Commit messages follow convention
- [ ] Commits are atomic and logical
- [ ] No merge conflicts
- [ ] Branch is up to date with base

## Final Checks
- [ ] All CI checks pass
- [ ] No linting errors
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Builds successfully
- [ ] Manual testing completed
