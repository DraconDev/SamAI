# SamAI - Smart AI Assistant

<p align="center">
  <img src="public/icon/128.png" alt="SamAI Logo" width="128" height="128"/>
</p>

SamAI is a powerful browser extension that brings intelligent AI assistance directly into your browsing experience. With seamless integration and privacy-focused design, it enhances your productivity across various web activities.

## ✨ Features

### 🔍 Smart Search Enhancement
- Intelligent analysis of search results
- Contextual insights and summaries
- Rich markdown formatting for better readability

### 💬 Contextual Chat
- Chat with AI about any webpage content
- Smart context understanding
- Code-aware responses with syntax highlighting

### ✍️ Writing Assistant
- Help with writing and editing
- Context-aware suggestions
- Multiple writing styles support

## 🚀 Getting Started

1. **Install Dependencies**
```bash
bun install
```

2. **Development**
```bash
bun dev             # Chrome development
bun dev:firefox     # Firefox development
```

3. **Build**
```bash
bun build          # Build for Chrome
bun build:firefox  # Build for Firefox
```

4. **Create Release Package**
```bash
bun zip           # Create zip for Chrome
bun zip:firefox   # Create zip for Firefox
```

## 🛠️ Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- WXT (Web Extension Tools)
- Markdown Support
- Google Gemini AI

## 🔐 Privacy

SamAI is designed with privacy in mind:
- All processing happens locally
- No data collection
- AI interactions are private and secure

## 🧩 Project Structure

```
src/
├── components/      # Reusable UI components
├── content/        # Content script implementations
├── utils/          # Utility functions and helpers
│   ├── ai/        # AI integration logic
│   └── store/     # State management
└── entrypoints/   # Extension entry points
    ├── popup/     # Extension popup
    ├── chat/      # Chat interface
    └── context/   # Context menu functionality
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [WXT](https://wxt.dev)
- UI components inspired by modern design principles
- Special thanks to all contributors

---

<p align="center">
  Made with ❤️ by the SamAI Team
</p>
