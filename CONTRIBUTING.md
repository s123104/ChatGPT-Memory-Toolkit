# Contributing to ChatGPT Memory Toolkit

Thank you for considering contributing to ChatGPT Memory Toolkit! We welcome contributions from everyone.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/your-username/chatgpt-memory-toolkit/issues) to see if the problem has already been reported.

When filing a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser version and OS
- Extension version

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear and descriptive title
- A detailed description of the proposed feature
- Explain why this enhancement would be useful
- Provide examples or mockups if possible

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**
4. **Test your changes**: Run `npm run dev` to ensure everything works
5. **Follow the coding standards** (see below)
6. **Commit your changes** with a descriptive commit message
7. **Push to your fork** and submit a pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Chrome 88 or higher (for testing)

### Getting Started

```bash
# Clone your fork
git clone https://github.com/your-username/chatgpt-memory-toolkit.git
cd chatgpt-memory-toolkit

# Install dependencies (CI reliable)
npm ci

# Start development
npm run dev

# Load extension in Chrome for testing
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the project directory
```

### Available Scripts

- `npm run dev` - Development mode (lint + watch)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run build` - Build for production

## 📝 Coding Standards

### JavaScript/HTML/CSS

- Follow the existing code style
- Use ESLint and Prettier (configs are included in the project)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Use clear and descriptive commit messages:

- `feat: add new export format option`
- `fix: resolve popup display issue on Chrome 88`
- `docs: update README installation instructions`
- `style: fix code formatting in popup.js`
- `refactor: simplify memory detection logic`

### Code Structure

- Keep components modular and reusable
- Place utility functions in the `utils/` directory
- Follow the existing directory structure
- Update documentation for any API changes

## 🧪 Testing

### Manual Testing

1. Load the extension in Chrome
2. Navigate to ChatGPT
3. Test the core functionality:
   - Memory detection
   - Export functionality
   - Settings panel
   - History management

### Automated Testing

While we don't have automated tests yet, we welcome contributions to add them!

## 🎨 UI/UX Guidelines

- Follow the existing design patterns and color scheme
- Ensure accessibility (proper contrast, keyboard navigation)
- Test on different screen sizes
- Maintain consistency with Chrome extension best practices
- Use the existing CSS variables for colors and spacing

## 📚 Documentation

When contributing, please:

- Update relevant documentation
- Add JSDoc comments for new functions
- Update README.md if adding new features
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) format

## 🚀 Release Process

Releases are handled by maintainers:

1. Version bump in `package.json` and `manifest.json`
2. Update CHANGELOG.md
3. Create release tag
4. Build and package for Chrome Web Store

## 💬 Communication

- [GitHub Discussions](https://github.com/your-username/chatgpt-memory-toolkit/discussions) for questions and ideas
- [GitHub Issues](https://github.com/your-username/chatgpt-memory-toolkit/issues) for bugs and feature requests

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 🏆 Recognition

Contributors will be recognized in:

- Release notes
- Contributors section (coming soon)
- Special thanks in major releases

## ❓ Questions?

Don't hesitate to ask questions in [GitHub Discussions](https://github.com/your-username/chatgpt-memory-toolkit/discussions) or create an issue.

Thank you for contributing! 🎉
