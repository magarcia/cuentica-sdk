---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: magarcia

---

## Bug Description
A clear and concise description of what the bug is.

## Reproduction Steps
Steps to reproduce the behavior:
1. Initialize SDK with '...'
2. Call method '...'
3. Pass parameters '...'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Code Example
```typescript
// Minimal code example that reproduces the issue
const api = new CuenticaAPI("token");
try {
  const result = await api.someMethod();
} catch (error) {
  console.error(error);
}
```

## Error Message
```
If applicable, paste the full error message or stack trace here
```

## Environment
- SDK Version: [e.g. 1.0.0]
- Node.js Version: [e.g. 18.15.0]
- TypeScript Version: [e.g. 4.9.5]
- Operating System: [e.g. Ubuntu 22.04, Windows 11, macOS 13.2]
- Package Manager: [e.g. npm 8.19.3, yarn 1.22.19]

## Context
- [ ] I have searched for existing issues before creating this one
- [ ] I can reliably reproduce this issue
- [ ] This issue appears in the latest version of the SDK

## Logs
If applicable, add debug logs. You can enable them by setting:
```bash
DEBUG=cuentica:* npm start
```

## Additional Context
Add any other context about the problem here, such as:
- When did this start happening?
- Does it happen consistently or intermittently?
- Are there any workarounds you've discovered?
- Do you have any theories about what might be causing it?

## Screenshots
If applicable, add screenshots to help explain your problem.

## Possible Solution
If you have any ideas about what might fix the issue, please share them here.
