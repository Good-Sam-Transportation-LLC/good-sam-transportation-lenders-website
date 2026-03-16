# Copilot Code Review Instructions

## Review Focus Areas

When reviewing pull requests, prioritize the following:

### Security
- Flag potential XSS, SQL injection, command injection vulnerabilities
- Check for hardcoded secrets, API keys, or credentials
- Verify proper input validation at system boundaries
- Flag unsafe use of dangerouslySetInnerHTML

### React Best Practices
- Verify proper use of React hooks (dependency arrays, rules of hooks)
- Check for missing key props in lists
- Flag direct DOM manipulation instead of React state
- Verify proper cleanup in useEffect hooks

### TypeScript
- Flag use of any type — suggest specific types
- Check for missing null/undefined handling
- Verify proper type narrowing in conditional blocks

### Accessibility
- Verify images have alt text
- Check form elements have labels
- Verify interactive elements are keyboard accessible
- Flag missing ARIA attributes on custom components

### Testing
- Every new component, hook, utility, or page MUST have a corresponding test file
- Test files follow the __tests__/ComponentName.test.tsx convention
- Flag PRs that add source files without corresponding tests

### Performance
- Flag unnecessary re-renders (missing useMemo/useCallback for expensive operations)
- Check for large bundle imports that could be code-split
- Verify images use appropriate formats and lazy loading

### Code Quality
- Flag console.log statements (use console.warn/error instead)
- Check for proper error handling in async operations
- Verify consistent naming conventions (PascalCase components, camelCase functions)
