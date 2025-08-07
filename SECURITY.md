# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| 1.4.x   | :white_check_mark: |
| 1.3.x   | :x:                |
| < 1.3   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in ChatGPT Memory Toolkit, please report it responsibly.

### How to Report

1. **Do NOT create a public GitHub issue** for security vulnerabilities
2. **Email us directly** at security@example.com (replace with actual email)
3. **Include the following information:**
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggested fixes (if available)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 5 business days
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days

### Disclosure Policy

- We follow responsible disclosure practices
- We will coordinate with you on the disclosure timeline
- We will credit you for the discovery (unless you prefer to remain anonymous)
- We will publish security advisories for confirmed vulnerabilities

## Security Measures

### Extension Security

Our extension implements several security measures:

- **Manifest V3**: Uses the latest Chrome extension security model
- **Minimal Permissions**: Only requests necessary permissions
- **Content Security Policy**: Strict CSP to prevent XSS attacks
- **Local Storage Only**: No data is transmitted to external servers
- **Code Review**: All code changes are reviewed for security issues

### Data Protection

- **No Data Collection**: We don't collect, store, or transmit personal data
- **Local Processing**: All memory processing happens locally in your browser
- **No External Connections**: The extension works entirely offline
- **Secure Storage**: Uses Chrome's secure storage APIs

### Development Security

- **Dependency Scanning**: Regular scanning of dependencies for vulnerabilities
- **Code Analysis**: Static code analysis for security issues
- **Secure Development**: Following secure coding practices
- **Regular Updates**: Keeping dependencies up to date

## Security Best Practices for Users

### Installation

- Only install from the official Chrome Web Store
- Verify the publisher before installation
- Review requested permissions

### Usage

- Keep the extension updated to the latest version
- Report any suspicious behavior immediately
- Review export data before sharing

### Browser Security

- Keep Chrome updated to the latest version
- Use a secure, updated operating system
- Be cautious with other installed extensions

## Known Security Considerations

### Browser Permissions

The extension requires these permissions:

- `activeTab`: To interact with ChatGPT pages
- `scripting`: To inject content scripts
- `storage`: To save settings and history locally

### Data Handling

- Memory data is processed locally in your browser
- Export files are generated client-side
- No data leaves your device without explicit user action (copy/download)

## Security Contact

For security-related questions or concerns:

- **Security Email**: security@example.com (replace with actual)
- **Response Time**: Within 48 hours
- **Encryption**: PGP key available upon request

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent
3. **Day 3-7**: Initial assessment and validation
4. **Day 8-30**: Development of fix
5. **Day 30+**: Coordinated disclosure and release

## Security Updates

Security updates are released as patch versions (e.g., 1.5.1 → 1.5.2) and include:

- Vulnerability fixes
- Security enhancements
- Updated dependencies

## Hall of Fame

We recognize security researchers who help improve our security:

<!-- Security researchers will be listed here -->

---

Thank you for helping keep ChatGPT Memory Toolkit secure! 🔒
