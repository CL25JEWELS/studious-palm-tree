# EchoForge

> Real-time loop-pad music creation app with social remix platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎵 Overview

EchoForge is a professional-grade, cross-platform music creation tool that makes loop-based composition accessible to everyone. Built with Web Audio API and TypeScript, it delivers sub-10ms latency audio processing with an intuitive pad-based interface.

### Key Features

- **Real-time Audio Processing**: Sub-10ms latency using Web Audio API
- **8+ Pad Grid**: Intuitive grid-based interface for triggering sounds
- **Per-Pad Controls**: Volume, pitch, pan, and effects for each pad
- **Multiple Playback Modes**: One-shot, loop, and hold modes
- **Quantization**: Beat-aligned triggering for perfect timing
- **Offline-First**: Full functionality without internet connection
- **Cross-Platform**: Web, iOS, Android, and Desktop support (coming soon)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/CL25JEWELS/studious-palm-tree.git
cd studious-palm-tree

# Install dependencies
pnpm install

# Start development server
pnpm dev:web
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific platform
pnpm build:web
```

## 📁 Project Structure

```
echoforge/
├── packages/
│   ├── shared-types/    # TypeScript type definitions
│   ├── core/            # Audio engine and controllers
│   ├── ui/              # Shared UI components
│   ├── web/             # Web application
│   ├── mobile/          # React Native mobile app (coming soon)
│   └── desktop/         # Electron desktop app (coming soon)
├── docs/                # Documentation
├── .github/             # GitHub templates and workflows
└── README.md
```

## 🎹 Usage

### Basic Workflow

1. **Initialize Audio**: Click anywhere to initialize the Web Audio context
2. **Trigger Pads**: Click or tap pads to trigger sounds
3. **Adjust Parameters**: Use sliders to control volume, pitch, and pan
4. **Use Transport**: Start/stop playback with transport controls
5. **Change Tempo**: Adjust BPM to match your desired tempo

### Keyboard Shortcuts

- `Space`: Play/Pause
- `Esc`: Stop
- `1-8`: Trigger pads 1-8
- `M`: Mute selected pad
- `S`: Solo selected pad

## 🏗️ Architecture

### Core Modules

- **AudioEngine**: Web Audio API-based audio processing
- **PadController**: Pad state management and routing
- **Transport**: Playback timing and synchronization
- **ProjectManager**: Project persistence and export

### Technology Stack

- **Frontend**: React 18, TypeScript 5
- **Build Tool**: Vite
- **Monorepo**: pnpm workspaces + Turborepo
- **Audio**: Web Audio API
- **Testing**: Vitest, Playwright

## 📚 Documentation

- [Technical Specification](./TECHNICAL_SPECIFICATION.md)
- [Project Context](./EchoForge.txt)
- [API Documentation](./docs/api/)
- [Contributing Guide](./CONTRIBUTING.md)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

## 🛠️ Development

### Code Style

We use ESLint and Prettier for consistent code formatting:

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes and commit: `git commit -m "feat: add new feature"`
3. Push to the branch: `git push origin feature/my-feature`
4. Open a Pull Request

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Issue Templates

- [Bug Report](./.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request](./.github/ISSUE_TEMPLATE/feature_request.md)
- [Design Proposal](./.github/ISSUE_TEMPLATE/design_proposal.md)

## 📋 Roadmap

### MVP (Current)
- [x] Core audio engine
- [x] 8-pad grid
- [x] Basic playback controls
- [x] Per-pad parameters
- [x] Web application

### Phase 2 (Q2 2024)
- [ ] Recording/sequencing
- [ ] Audio export (WAV/MP3)
- [ ] 16-pad grid
- [ ] Advanced effects
- [ ] Mobile responsive design

### Phase 3 (Q3 2024)
- [ ] User accounts
- [ ] Project sharing
- [ ] Remix functionality
- [ ] Cloud sync
- [ ] Community sound packs

### Phase 4 (Q4 2024)
- [ ] React Native mobile apps
- [ ] Electron desktop app
- [ ] MIDI controller support
- [ ] VST integration

## 🔒 Security

For security issues, please email security@echoforge.app instead of using the issue tracker.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Web Audio API team for the excellent audio processing capabilities
- React team for the amazing UI framework
- The open-source community for inspiration and support

## 📞 Contact

- Website: https://echoforge.app (coming soon)
- Twitter: [@echoforgeapp](https://twitter.com/echoforgeapp)
- Discord: [Join our community](https://discord.gg/echoforge)

---

Made with ❤️ by the EchoForge team
