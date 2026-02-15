# LoopPad 🎵

**A TypeScript-first web-based drum machine and sampler**

Production-ready MVP with Web Audio API, sub-10ms latency, 32+ voice polyphony, modular sound packs, and offline/cloud support.

[![CI](https://github.com/CL25JEWELS/studious-palm-tree/workflows/CI/badge.svg)](https://github.com/CL25JEWELS/studious-palm-tree/actions)

## ✨ Features

- 🎹 **8-16 Pad Grid**: Trigger sounds with keyboard or mouse
- ⚡ **Sub-10ms Latency**: Optimized for real-time performance
- 🎼 **32+ Voice Polyphony**: Multiple simultaneous sounds
- 📦 **Modular Sound Packs**: Hot-swappable sound libraries
- 🔄 **Quantization**: Beat-aligned timing
- 💾 **Offline/Cloud Support**: IndexedDB caching and cloud sync
- 🎨 **EDM-Inspired UI**: Dark theme with vibrant colors
- 📱 **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Modern browser with Web Audio API support

### Installation

```bash
# Clone the repository
git clone https://github.com/CL25JEWELS/studious-palm-tree.git
cd studious-palm-tree

# Install dependencies
npm install

# Build all packages
npm run build
```

### Development

```bash
# Start the web app in development mode
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build all packages for production
npm run build

# Preview the web app
cd apps/web
npm run preview
```

## 📁 Project Structure

```
studious-palm-tree/
├── packages/
│   └── core/                 # Core audio engine and models
│       ├── src/
│       │   ├── models/       # TypeScript data models
│       │   ├── engine/       # Web Audio API engine
│       │   └── utils/        # Utility functions
│       └── dist/             # Built package
├── apps/
│   └── web/                  # React web application
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── hooks/        # React hooks
│       │   └── styles/       # Design system
│       └── dist/             # Built app
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # Architecture overview
│   ├── API.md                # API usage guide
│   └── CI-CD.md              # CI/CD guidance
└── .github/
    └── workflows/            # GitHub Actions
```

## 🏗️ Architecture

LoopPad follows a modular monorepo architecture:

- **@looppad/core**: TypeScript-first core engine
  - Data models (Pad, Instrument, SoundPack, Project)
  - AudioEngine (Web Audio API wrapper)
  - Transport (timing and quantization)
  - VoicePool (polyphony management)
  - SoundLoader (asset loading with caching)

- **@looppad/web**: React web application
  - PadGrid component (8-16 pads)
  - Transport controls (play, stop, tempo)
  - SoundPack selector
  - EDM-inspired design system

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 📚 API Usage

### Basic Example

```typescript
import { AudioEngine, generateId } from '@looppad/core';

// Initialize engine
const engine = new AudioEngine({
  maxVoices: 32,
  latency: 'interactive',
});
await engine.initialize();

// Load and trigger a sound
const instrument = {
  id: generateId(),
  name: 'Kick',
  sampleId: 'kick-01',
  volume: 0.8,
  // ... other properties
};

engine.registerInstrument(instrument);
engine.trigger(instrument.id, 1.0);
```

See [docs/API.md](docs/API.md) for complete API documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🔧 Development Scripts

```bash
npm run build        # Build all packages
npm run test         # Run all tests
npm run lint         # Lint all packages
npm run type-check   # TypeScript type checking
```

## 🎨 Design System

LoopPad features an EDM-inspired design system:

- **Dark Theme**: Deep blacks with elevated surfaces
- **Vibrant Accents**: Cyan, magenta, yellow, green
- **16 Pad Colors**: Unique color per pad
- **Glow Effects**: Active state indicators
- **Responsive Layout**: Adapts to screen size

## 🎯 Performance

- **Latency**: <10ms from trigger to sound
- **Polyphony**: 32+ simultaneous voices
- **Sample Loading**: <500ms per sound pack
- **Memory**: <100MB typical usage

## 🌐 Browser Support

- Chrome 35+
- Firefox 25+
- Safari 14.1+
- Edge 79+

Requires Web Audio API and ES2022 support.

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Usage Guide](docs/API.md)
- [CI/CD Guidance](docs/CI-CD.md)

## 🤝 Contributing

Contributions are welcome! Please read the contribution guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🎵 About

LoopPad is a loop pad social network - a platform for creating, sharing, and discovering beat patterns and drum sequences. Built with TypeScript, React, and the Web Audio API.

---

Made with ❤️ by the LoopPad team
