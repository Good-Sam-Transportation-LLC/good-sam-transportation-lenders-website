# Copilot Code Review Instructions

## Review Behavior

- **Always attempt to fix issues**: For every issue identified during review, provide a concrete code fix using GitHub suggestion blocks. Never leave a comment without a fix.
- **Autonomous operation**: All suggestions are automatically applied without human review. Ensure every suggestion is correct, complete, and safe to apply immediately.
- **No advisory-only comments**: Do not post comments that only describe a problem. Every comment MUST include a `suggestion` block with the corrected code.
- Use triple-backtick `suggestion` blocks to propose inline fixes for every comment.
- If a fix requires changes across multiple files, create separate suggestion comments for each file.
- When identifying missing tests, provide a complete test file as a suggestion.
- Verify that each suggestion maintains backward compatibility and does not introduce regressions.
- Each suggestion must be independently valid — do not create suggestions that depend on other suggestions being applied first.

## Review Focus Areas

When reviewing pull requests, prioritize the following:

### Security
- Flag potential XSS, SQL injection, command injection vulnerabilities
- Check for hardcoded secrets, API keys, or credentials
- Verify proper input validation at system boundaries
- Flag unsafe use of `dangerouslySetInnerHTML`

### React Best Practices
- Verify proper use of React hooks (dependency arrays, rules of hooks)
- Check for missing `key` props in lists
- Flag direct DOM manipulation instead of React state
- Verify proper cleanup in useEffect hooks

### TypeScript
- Flag use of `any` type — suggest specific types
- Check for missing null/undefined handling
- Verify proper type narrowing in conditional blocks

### Accessibility
- Verify images have alt text
- Check form elements have labels
- Verify interactive elements are keyboard accessible
- Flag missing ARIA attributes on custom components

### Testing
- Every new component, hook, utility, or page MUST have a corresponding test file
- Test files follow the `__tests__/ComponentName.test.tsx` convention
- Flag PRs that add source files without corresponding tests
- When a fix is applied, the auto-test-generation workflow will create tests automatically — but always include test suggestions in your review comments as well

### Performance
- Flag unnecessary re-renders (missing useMemo/useCallback for expensive operations)
- Check for large bundle imports that could be code-split
- Verify images use appropriate formats and lazy loading

### Code Quality
- Flag console.log statements (use console.warn/error instead)
- Check for proper error handling in async operations
- Verify consistent naming conventions (PascalCase components, camelCase functions)
