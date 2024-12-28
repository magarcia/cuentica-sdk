# Contributing to Cuéntica SDK

Thank you for your interest in contributing to the Cuéntica SDK! This document provides guidelines and instructions for contributing to this open-source project.

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive, and harassment-free environment. Please be respectful of all contributors regardless of background or experience level.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/cuentica-sdk.git`
3. Create a branch for your changes: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development Setup

1. Copy `.env.example` to `.env` and fill in your test API credentials
2. Run tests to ensure everything is set up correctly: `npm test`
3. Start the development environment: `npm run dev`

## Making Changes

### Coding Standards

- Write in TypeScript
- Follow the existing code style
- Maintain type safety - avoid using `any`
- Document all public APIs using TSDoc comments
- Keep functions focused and modular
- Add appropriate error handling

### Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting: `npm test`
- Include both unit and integration tests where appropriate

### Documentation

- Update the README.md if adding new features
- Add TSDoc comments for new methods and classes
- Update type definitions where necessary
- Include examples for new functionality
- Update the API documentation if endpoints change

## Commit Guidelines

- Use semantic commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `test:` for test changes
  - `chore:` for maintenance tasks
- Keep commits focused and atomic
- Reference issues in commit messages when applicable

## Pull Request Process

1. Update your fork with the latest main branch changes
2. Ensure your changes pass all tests and lint checks
3. Create a pull request with a clear description of the changes
4. Include any relevant issue numbers
5. Update documentation as needed
6. Wait for review and address any feedback

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Type definitions updated
- [ ] Lint checks passing
- [ ] Branch up to date with main
- [ ] Commit messages follow guidelines

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- SDK version
- Node.js version
- Minimal code example to reproduce
- Expected vs actual behavior
- Any error messages or logs
- Steps to reproduce

### Feature Requests

For feature requests, please:

- Clearly describe the feature
- Explain the use case
- Provide examples of how it would be used
- Note if it's related to a problem

## Development Workflow

1. Choose an issue to work on or create a new one
2. Comment on the issue to let others know you're working on it
3. Fork and clone the repository
4. Create a feature branch
5. Make your changes
6. Write/update tests
7. Update documentation
8. Submit a pull request

## Release Process

The maintainers will handle releases following semantic versioning:

- Major version: Breaking changes
- Minor version: New features, no breaking changes
- Patch version: Bug fixes, no breaking changes

## API Changes

When making changes that affect the API:

1. Document all changes thoroughly
2. Update type definitions
3. Add migration guides for breaking changes
4. Update examples in documentation
5. Consider backward compatibility

## Getting Help

- Create an issue for bugs or feature requests
- Tag questions with 'question' label
- Be clear and provide context
- Search existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

Thank you for contributing to the Cuéntica SDK!
